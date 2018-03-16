export const Html = ({ body, head }) => `
  <!DOCTYPE html>
  <html>
    <head>
      ${head}
    </head>
    <body style="margin:0">
      <div id="app">${body}</div>
    </body>
  </html>
`;
