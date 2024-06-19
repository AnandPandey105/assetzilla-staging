const moment = require("moment");
const generateNewsLetter = (name, articles, tags, email, cityNames) => {
  let newsletterEmailTemplate = "";
  let start = `
  <!doctype html>
  <html lang="en">
    <head>
        <!-- Required meta tags -->
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;400;700&display=swap" rel="stylesheet">
        <title>Assets Zilla</title>
        <style>
            *,
            ::after,
            ::before {
                box-sizing: border-box;
            }
        </style>
    </head>
    <body style="background: #f4f4f4;font-size: 15px;line-height:20px;">
        <div style="max-width:650px; margin:0 auto;background:white;font-family: 'Poppins', sans-serif;">
            <div style="width:100%;float:left;margin-top:10px;background: #f3f9ff;padding: 15px 15px;box-sizing: border-box;">
                <div style="width:100%;float:left;text-align: center;padding-top: 25px; padding-bottom:25px;">
                    <a href="https://assetzilla.com/"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/logo.png" style="text-align: center;margin: 0 auto;height: 60px;object-fit: contain;"></a>
                </div>
                <div style="width:100%;float:left;text-align:center;">
                    <div style="background: #FFFFFF;border-radius: 29px;padding: 15px;margin-bottom:25px;">
                    <h4 style="font-size: 16px;color: #7EB041;text-align: center;margin-top: 10px;font-weight: 600;margin-bottom: 0px;">Trending Topics</h4>
                      <div style="padding: 10px; text-align:left">`;
  let tagsHtml = ``;
  tags.forEach((tag) => {
      let html = `      <a href="https://assetzilla.com/news/tags/${tag.key}" 
                          style="font-size: 14px;
                                color: #347bbf;
                                margin-right: 5px;
                                border: 1px solid #347bbf;
                                display: inline-block;
                                max-width:100%;
                                margin-bottom: 5px;
                                font-weight: 400 !important;
                                padding: 6px 10px;
                                border-radius: 0.25rem;
                                line-height: 100%;
                                text-decoration: none;">
                          <span class="badge badge-pill sidebar-tags-pill" style="color: #347bbf;">${tag.key} (${tag.doc_count})</span>
                        </a>`;
    tagsHtml += html;
  });
  newsletterEmailTemplate = start + tagsHtml + 
                      `</div>`;

  newsletterEmailTemplate += `
                      <h4 style="font-size: 16px;color: #7EB041;text-align: center;margin-top: 10px;font-weight: 600;margin-bottom: 0px;">This Week's Top 5 News Articles</h4>
                      <div class="" style="width:100%">`;

  let articlesHtml = ``;
  articles.forEach((article) => {
    let html = `
                        <div style="width:95%; display:inline-block">
                          <div style="border:1px solid #00000042; background: #ffffff; border-radius: 6px; overflow: hidden; margin:7.5px;  ">
                            <a href="https://assetzilla.com${article.url}" style="max-width:30%; object-fit:cover">
                              <img src="<%=locals.CURRENT_IMAGE_BASE_URL%>/news/${
                                article.images
                              }" style="height: 100%; width: 100%; max-width:100%; vertical-align: middle;">
                            </a>
                            <div style="padding: 15px; ">
                              <a href="https://assetzilla.com${
                                article.url
                              }" style="margin-top: 0; font-size: 16px; font-weight: 400; line-height: 130%; color: #000000; display:block; margin-bottom: 12px; text-decoration:none; text-align: left;">
                                ${article.heading}
                              </a>
                              <a href="https://assetzilla.com${
                                article.url
                              }" style="text-align: left; font-weight: 400; line-height: 100%; color: #8c8c8c; margin-bottom: 10px; display:block; text-decoration:none; color:gray; margin-top: 0;">
                                Published on -${moment(article.publish_date).format("DD MM YYYY")}  
                              </a>        
                            </div>
                          </div>
                        </div>`;
    articlesHtml += html;
  });

  newsletterEmailTemplate += articlesHtml

  newsletterEmailTemplate += `
                        <div style="color: #fff; background: #347bbf; border: 1px solid #347bbf; width: 95%; margin: auto; padding: 5px; border-radius: 8px;">
                          <a href="https://assetzilla.com/news/" style="text-decoration:none;">
                            <p style="color: #fff; margin:0px;">See all</p>
                          </a>
                        </div>
                      </div>`;



  let cityNamesHtml = `
                      <h4 style="font-size: 16px;color: #7EB041;text-align: center;margin-top: 1.33rem;font-weight: 600;margin-bottom: 0px;">Search News by City</h4>
                      <div style="padding: 10px; text-align:left">`;

  cityNames.forEach((city) => {
    let html = `
                        <a href="https://assetzilla.com/news/tags/${city.key}" style="font-size: 14px;
                          color: #347bbf;
                          margin-right: 5px;
                          border: 1px solid #347bbf;
                          display: inline-block;
                          max-width:100%;
                          margin-bottom: 5px;
                          font-weight: 400 !important;
                          padding: 6px 10px;
                          border-radius: 0.25rem;
                          line-height: 100%;
                          text-decoration: none;">
                          <span class="badge badge-pill sidebar-tags-pill" style="color: #347bbf;">${city.key} (${city.doc_count})</span>
                        </a>`;
    cityNamesHtml += html;
  });

  newsletterEmailTemplate += cityNamesHtml + 
                      `</div>`;
  
  newsletterEmailTemplate += 
        `         <h4 style="font-size: 20px;">Thanks!</h4>
                  <a href="https://assetzilla.com/"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/logo.png" style="width:80px;"></a>
                  <ul style="list-style: none; padding-left:0;">
                      <li style="display: block;margin-right: 0px;">
                          <a style="font-size: 12px;color: #347BBF;text-align: center;line-height: 20px;font-weight: 600; text-decoration: none;" href="javascript:;">
                              For Buyers: support@assetzilla.com
                          </a>
                      </li>    
                      <li style="display: block;margin-right: 0px;">
                          <a style="font-size: 12px;color: #347BBF;text-align: center;line-height: 20px;font-weight: 600; text-decoration: none;" href="javascript:;">
                            For Sellers: seller@assetzilla.com
                          </a>
                      </li>
                  </ul>
                  <ul style="list-style: none;padding-left: 0;padding-top: 5px;">
                      <li style="display: inline-block;margin-right: 30px;">
                          <a href="https://www.facebook.com/AssetZilla-102693262614064/?modal=admin_todo_tour"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/f-icon.png" alt=""></a>
                      </li>
                      <!--<li style="display: inline-block;margin-right: 30px;">
                          <a href="https://www.linkedin.com/company/assetzilla/about/?viewAsMember=true"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/lk-icon.png" alt=""></a>
                      </li>-->
                      <li style="display: inline-block;margin-right: 30px;">
                        <a href="https://www.instagram.com/assetzilla/"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/instagram_.png" width="28px" alt=""></a>
                      </li>
                  </ul>
                  <a href="https://assetzilla.com/newsletter/unsubscribe?email=${email}">Unsubscribe</a>
                </div>
              </div>
            </div>
          </div>
        </body>
  </html>`;
  //   console.log(newsletterEmailTemplate);
  return newsletterEmailTemplate;
};

module.exports = generateNewsLetter;
