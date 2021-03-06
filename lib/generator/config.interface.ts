/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface IJekyllConfig {
  title?: string;
  email?: string;
  author?: string;
  description?: string;
  baseurl?: string;
  url?: string;
  date_format?: string;
  header_pages?: string[];
  google_verification?: string;
  google_analytics?: string;
  google_tag_manager?: string;
  bing_verification?: string;
  animated?: boolean;
  show_related_posts?: boolean;
  show_post_footers?: boolean;
  show_social_icons?: boolean;
  ajaxify_contact_form?: boolean;
  enable_mathjax?: boolean;
  extended_fonts?: boolean;
  enable_anchorjs?: boolean;
  post_preview_image?: boolean;
  fb_page?: boolean;
  fb_page_id?: string;
  disqus_shortname?: string;
  txtpen_sitename?: string;
  facebook_comments?: string;
  facebook_appid?: string;
  facebook_comments_number?: number;
  github_username?: string;
  reddit_username?: string;
  bitbucket_username?: string;
  stackoverflow_id?: string;
  twitter_username?: string;
  skype_username?: string;
  steam_nickname?: string;
  google_plus_id?: string;
  linkedin_username?: string;
  angellist_username?: string;
  medium_id?: string;
  bitcoin_url?: string;
  paypal_url?: string;
  flattr_button?: string;
  telegram_username?: string;
  vk_id?: string;
  show_sharing_icons?: boolean;
  share_facebook?: boolean;
  share_twitter?: boolean;
  share_googleplus?: boolean;
  share_linkedin?: boolean;
  share_digg?: boolean;
  share_tumblr?: boolean;
  share_reddit?: boolean;
  share_stumbleupon?: boolean;
  share_hackernews?: boolean;
  text?: {
    pagination?: {
      newer?: string;
      older?: string;
      [k: string]: any;
    };
    share_buttons?: {
      text?: string;
      facebook?: string;
      twitter?: string;
      googleplus?: string;
      linkedin?: string;
      digg?: string;
      tumblr?: string;
      reddit?: string;
      stumbleupon?: string;
      hackernews?: string;
      [k: string]: any;
    };
    post?: {
      updated?: string;
      minute_read?: string;
      related_posts?: string;
      [k: string]: any;
    };
    index?: {
      [k: string]: any;
    };
    contact?: {
      email?: string;
      content?: string;
      subject?: string;
      submit?: string;
      ajax?: {
        sending?: string;
        sent?: string;
        error?: string;
        [k: string]: any;
      };
      thanks?: string;
      og_locale?: string;
      [k: string]: any;
    };
    [k: string]: any;
  };
  [k: string]: any;
}
