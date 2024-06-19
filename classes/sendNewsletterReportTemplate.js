const moment = require("moment");
const generateReportTemplate = (report) => {
  let newsletterEmailTemplate = `
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
              <h4 style="font-size: 16px;color: #7EB041;text-align: center;margin-top: 10px;font-weight: 600;margin-bottom: 0px;">Sunday Newsletter Report for</h4>
              <h5 style="font-size: 16px;color: #7EB041;text-align: center;margin-top: 10px;font-weight: 600;margin-bottom: 0px;">${moment(Date.now()).tz('Asia/Kolkata').format("YYYY MMMM DD hh:mm A")}</h5>
                <div style="padding: 10px; text-align:left">
                  <table>
                      <thead>
                        <tr>
                          <td style="text-align: left; padding:0.5rem; vertical-align:top;"></td>
                          <td style="text-align: left; padding:0.5rem; vertical-align:top;">Count</td>
                          <td style="text-align: left; padding:0.5rem; vertical-align:top;">Emails</td>
                        </tr>
                      </thead>
                      <tbody>
                          <tr style="border-bottom:1px solid black;">
                              <td style="text-align: left; padding:0.5rem; vertical-align:top;">Total:</td>
                              <td style="text-align: left; padding:0.5rem; vertical-align:top;">${report.total}</td>
                          </tr>
                          <tr style="border-bottom:1px solid black;">
                              <td style="text-align: left; padding:0.5rem; vertical-align:top;">Success:</td>
                              <td style="text-align: left; padding:0.5rem; vertical-align:top;">${report.success.count}</td>
                              <td style="text-align: left; padding:0.5rem; vertical-align:top;">${report.success.emails.join(", ")}</td>
                          </tr>
                          <tr>
                              <td style="text-align: left; padding:0.5rem; vertical-align:top;">Failure:</td>
                              <td style="text-align: left; padding:0.5rem; vertical-align:top;">${report.failure.count}</td>
                              <td style="text-align: left; padding:0.5rem; vertical-align:top;">${report.failure.emails.join(", ")}</td>
                          </tr>
                      </tbody>                        
                  </table>
                </div>
            </div>
          </div>
          <div style="text-align:center;">
            <h4 >Thanks!</h4>
            <a href="https://assetzilla.com/"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/logo.png" style="width:80px;"></a>
          </div>
        </div>
      </div>
    </body>
  </html>`;
  //   console.log(newsletterEmailTemplate);
  return newsletterEmailTemplate;
};

module.exports = generateReportTemplate;
