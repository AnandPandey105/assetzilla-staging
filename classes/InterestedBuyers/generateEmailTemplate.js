const moment = require("moment");
const {
    changeNumberFormat,
    numberWithCommas,
  } = require("../numberFormatter");

const generateEmailTemplate = (count, url, project, results, email) => {
  let emailTemplate = `
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
                        <h3 style="color: black; text-align: center;margin-top: 15px;font-weight: 600;margin-bottom: 30px;">
                            ${count} ${count > 1 ? "properties are" : "property is"} available for ${project} 
                        </h3>
                        <div style="margin:auto; text-align:center;">`
                    let max = 6;
                    if (results.length < max){
                      max = results.length;
                    }
                    for(let i = 0; i < max; i++){
                        console.log(results[i], i)
                        emailTemplate +=
                        `<div style="height: 250px; border:1px solid #c0c0c0; border-radius: 10px !important; margin: 10px; max-width:250px; display:inline-block">
                          <div style="height:150px; overflow:hidden">
                            <img src="<%=locals.CURRENT_IMAGE_BASE_URL%>/project/image/${results[i].images.Projects[0]}" style="width:100%; height:100%; object-fit: cover; border-radius:10px 10px 0px 0px" alt="">
                          </div>
                          <div style="padding: 10px;" class="content p-2">
                            <a style="text-decoration:none;" 
                            href="https://assetzilla.com/${results[i].url}"> 
                              <p style="margin-top:0px; font-size: 13px !important; text-align:left; color: black; font-weight: 600; font-family: 'Lato-regular'; font-style: normal;">${results[i].name}</p>
                            </a>`
                            if(results[i].price && results[i].price.price){
                                emailTemplate += `<p class="" style="text-align:left ">Price: ₹ ${changeNumberFormat(results[i].price.price)}</p>`
                            }
                            emailTemplate +=
                          `
                          </div>
                        </div>`
                    };

emailTemplate +=
                      `</div>
                      <div style="padding: 10px; text-align:center; margin-top:30px;">
                        <div style="color: #fff; background: #347bbf; border: 1px solid #347bbf; width: 186px; margin: auto; padding: 15px 20px; border-radius: 8px;">
                          <a href=${url} style="text-decoration:none;">
                            <p style="color: #fff; margin:0px;">Explore all ${results.length} results</p>
                          </a>
                        </div>
                        <h4>Thanks!</h4>
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
                        <a href="https://assetzilla.com/interested-properties/unsubscribe?email=${email}">Unsubscribe</a>
                    </div>
                </div>
            </div>
        </body>
    </html>`;
  //   console.log(emailTemplate);
  return emailTemplate;
};

module.exports = generateEmailTemplate;
