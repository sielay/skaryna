import * as path from "path";
import * as fs from "fs";
import * as React from "react";
import { loadConfig } from "./config";
import { IJekyllConfig } from "./config.interface";
import { renderToString } from "react-dom/server";
import { Html } from "../page/html";
import * as ReactMarkdown from "react-markdown";
import * as Safe from "react-safe";
import * as yaml from "js-yaml";
import * as rimraf from "rimraf";
import * as mkdirp from "mkdirp";
export const Markdown = ReactMarkdown;

export interface ISkarynaPageProps extends IJekyllConfig {
    url?: string;
    markdown?: string;
    children?: React.ReactNode;
}

export type TReactComponent = new (...args: any[]) => React.Component<ISkarynaPageProps, any>;
export type TReactPureFunction = (props?: ISkarynaPageProps) => JSX.Element;
export type TReactComponentHash = {
    [key: string]: TReactComponent | TReactPureFunction
};

export interface ISkarynaPageInfo {
    layout?: string;
    title?: string;
    date?: string;
    categories?: string[];
    tags?: string[];
    permalink?: string;
}

export interface ISkarynaPageBundle {
    markdown: string;
    meta: ISkarynaPageInfo;
    fileName?: string;
};

export class Skaryna {

    public static async init(source: string, dest: string): Promise<Skaryna> {
        const config = await loadConfig(path.join(source, "_config.yml"));
        return new Skaryna(config, source);
    }

    public static asyncScript(src: string) {
        return <Safe.script src={src} />;
    }
    public static script(content: string) {
        return <Safe.script>{content}</Safe.script>;
    }

    private layouts: TReactComponentHash = {};

    constructor(private config: IJekyllConfig, private sourceDirectory: string) {

    }

    public registerLayout(name: string, component: TReactComponent | TReactPureFunction) {
        this.layouts[name] = component;
    }

    public async buildSite(IndexPage: TReactComponent | TReactPureFunction, HeadContent: TReactComponent | TReactPureFunction) {
        await this.rimraf();
        await this.buildPages(IndexPage, HeadContent);
    }

    private async buildPages(IndexPage: TReactComponent | TReactPureFunction, HeadContent: TReactComponent | TReactPureFunction) {

        const index = this.pageProps({
            url: "/"
        });

        const pages = await this.gatherPosts(this.sourceDirectory);
        const posts = await this.gatherPosts(path.join(this.sourceDirectory, "_posts"));

        const drafts = await this.gatherPosts(path.join(this.sourceDirectory, "_drafts"));

        await Promise
            .all([
                ...posts,
                ...drafts
            ]
                .map(this.renderPost.bind(this, HeadContent)))
        await Promise.all(pages.map(this.renderPage.bind(this, HeadContent)));

        this.generatePage(
            "index.html",
            <IndexPage {...index} />,
            <HeadContent {...index} />
        );
    }

    private async renderPage(HeadContent: TReactComponent | TReactPureFunction, page: ISkarynaPageBundle) {

        const index = this.pageProps({
            url: page.meta.permalink || page.fileName.replace(/\.(md|MD)$/, ".html"),
            markdown: page.markdown,
            ...page.meta
        });

        return this.producePage(HeadContent, index);
    }

    private async renderPost(HeadContent: TReactComponent | TReactPureFunction, page: ISkarynaPageBundle) {

        const matches = page.fileName.match(/^(\d+)-(\d+)-(\d+)-(.+)$/);

        const index = this.pageProps({
            url: [
                "blog",
                matches[1],
                matches[2],
                matches[3],
                matches[4],
                "index.html"
            ].join("/"),
            markdown: page.markdown,
            ...page.meta
        });

        return this.producePage(HeadContent, index);
    }

    private async producePage(HeadContent: TReactComponent | TReactPureFunction, props: ISkarynaPageProps) {
        if (!props.layout && !this.layouts["default"]) {
            throw new Error(`Page ${props.fileName} doesn't define layout and default layout is not defined either.`);
        }
        const layoutName = props.layout || "default";
        if (!this.layouts[layoutName]) {
            throw new Error(`Page ${props.fileName} uses undefined layout ${layoutName}.`);
        }
        const Layout = this.layouts[layoutName];

        this.generatePage(
            props.url,
            <Layout {...props} />,
            <HeadContent {...props} />
        );
    }

    private async gatherPosts(directory) {
        const filePaths = await this.findMarkdowns(directory);
        const pages: ISkarynaPageBundle[] = filePaths.map(this.readPage.bind(this, directory));
        return await Promise.all(pages);
    }

    private async readPage(directory: string, fileName: string) {
        const fileContent = await this.loadFile(path.join(directory, fileName));
        return await this.parsePageFile(fileName, fileContent);
    }

    private async parsePageFile(fileName: string, content: string): Promise<ISkarynaPageBundle> {
        const match = content.match(/^([\s\t\n\r]*)---([\s\t]*)\n([\s\S]+)([\n\r]+)---/m);
        let markdown = content;
        let meta: ISkarynaPageInfo = {};
        if (match) {
            meta = await this.readPageInfo(match[3]);
            markdown = markdown.replace(match[0], "");
        }
        return {
            fileName,
            markdown,
            meta
        };
    }

    private async readPageInfo(content): Promise<ISkarynaPageInfo> {
        const data = yaml.safeLoad(content)
        data.categories = data.categories ? data.categories.split(/\s+/) : [];
        data.tags = data.tags ? data.tags.split(/\s+/) : [];
        return data as ISkarynaPageInfo;;
    }

    private findMarkdowns(directory): Promise<string[]> {
        return new Promise((resolve, reject) => {
            fs.readdir(directory, (error: NodeJS.ErrnoException, files: string[]) => {
                if (error) {
                    return reject(error);
                }
                resolve(files
                    .filter(fileName => fileName.match(/\.(md|MD)$/)));
            });
        });
    }

    private loadFile(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, "utf8", (error: NodeJS.ErrnoException, data: string) => {
                if (error) {
                    return reject(error);
                }
                resolve(data);
            });
        });
    }

    private pageProps(pageConfig: ISkarynaPageProps): ISkarynaPageProps {
        return Object.assign(Object.assign({
            original: this.config
        }, this.config), pageConfig);
    }

    private async generatePage(filePath: string, RootElement: JSX.Element, HeadElement: JSX.Element) {
        const body = Html({
            body: renderToString(RootElement),
            head: renderToString(HeadElement)
        });

        return await this.saveFile(path.join(this.sourceDirectory, "_site", filePath), body);
    }

    private saveFile(filePath: string, content: string) {
        if (filePath.match(/\/$/)) {
            filePath = path.join(filePath, "index.html");
        }
        const dirname = path.dirname(filePath);
        return new Promise((resolve, reject) => {
            mkdirp(dirname, (error: NodeJS.ErrnoException) => {
                if (error) {
                    return reject(error);
                }
                fs.writeFile(filePath, content, "utf8", (error2: NodeJS.ErrnoException) => {
                    if (error2) {
                        return reject(error2);
                    }
                    resolve();
                });
            });
        });
    }

    private rimraf() {
        const directory = path.join(this.sourceDirectory, "_site");
        return new Promise((resolve, reject) => {
            rimraf(directory, (error: NodeJS.ErrnoException) => {
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        });
    }

}
