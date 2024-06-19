const Templates = {
  newsletterSubscribe: {
    subject: "Welcome to Assetzilla",
    html: `

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
         <body style="background: #f4f4f4;font-size: 15px;line-height:20px;}">
            <div style="max-width:650px; margin:0 auto;background:white;font-family: 'Poppins', sans-serif;">
               <div style="width:100%;float:left;margin-top:10px;background: #f3f9ff;padding: 15px 50px;box-sizing: border-box;">
                  <div style="width:100%;float:left;text-align: center;padding-top: 25px;">
                    <a href="https://assetzilla.com/"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/logo.png" style="text-align: center;margin: 0 auto;height: 60px;object-fit: contain;"></a>
                  </div>
                  <div style="width:100%;float:left;text-align:center;">
                     <img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/prop.webp" style="margin-top:25px;margin-bottom:15px;max-width: 100%;height: 200px;object-fit: contain;">
                     <div style="background: #FFFFFF;box-shadow: 0 2px 10px 3px #F6F6F6;border-radius: 29px;padding: 15px;margin-bottom:25px;">
                        <h4 style="font-size: 14px;color: #000;text-align: center;margin-top: 0;margin-bottom: 5px;">Hello {{{email}}}</h4>
                     <h4 style="font-size: 24px;color: #7EB041;text-align: center;margin-top: 10px;font-weight: 400;margin-bottom: 0px;">Welcome to AssetZilla</h4>
                    
                     <p style="max-width: 500px;margin: 0 auto;
                     font-size: 14px;
                     color: #6A6A6A;
                     text-align: center;
                     font-weight: 400;
                     line-height: 180%;
                     padding-top: 20px;
                      ">
                      Thanks for subscribing to our newsletters. We will keep sending you updates.
                     </p>
                     <br><br>
                    
                     
                     <a href="https://assetzilla.com/"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/logo.png" style="width:80px;"></a>
                     <ul style="list-style: none;padding-left: 0;">
                      <li style="display: inline-block;margin-right: 30px;"><a style="font-size: 12px;color: #347BBF;text-align: center;line-height: 20px;font-weight: 600; text-decoration: none;" href="javascript:;">seller@assetzilla.com</a></li>
                      
                      <li style="display: inline-block;margin-right: 0px;"><a style="font-size: 12px;color: #347BBF;text-align: center;line-height: 20px;font-weight: 600; text-decoration: none;" href="javascript:;"> support@assetzilla.com </a></li>
                   </ul>
                      
                       <ul style="list-style: none;padding-left: 0;padding-top: 5px;">
                          <li style="display: inline-block;margin-right: 30px;"><a href="https://www.facebook.com/AssetZilla-102693262614064/?modal=admin_todo_tour"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/f-icon.png" alt=""></a></li>
                          <!--<li style="display: inline-block;margin-right: 30px;">
          <a href="https://www.linkedin.com/company/assetzilla/about/?viewAsMember=true"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/lk-icon.png" alt=""></a>
      </li>-->
      <li style="display: inline-block;margin-right: 30px;">
        <a href="https://www.instagram.com/assetzilla/"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/instagram_.png" width="26px" alt=""></a>
      </li>
                          
                       </ul>
                     </p>
                  </div>
               </div>
            </div>
         </body>
      </html>
      
      `,
  },
};
module.exports = Templates;
