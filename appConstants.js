let nodemailerAuth = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "support@assetzilla.com",
    pass: "useremails",
  },
};

let nodemailerAuthNewsletter = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "newsletters@assetzilla.com",
    pass: "newsletters2023",
  },
}

let emailFrom = "support@assetzilla.com";
let emailFromNewsletter = "newsletters@assetzilla.com";

let emailTo = "support@assetzilla.com";
let subject = "Appointment Scheduled";
let rescheduledSubject = "Appointment Rescheduled";

let subjectForAddingProperty = {
  admin: "New Property Added By User",
  user: "New Property Added",
};

let subjectForDeletingProperty = {
  admin: "A Property Deleted By User",
  user: "Property Deleted",
};

let subjectForApprovedProperty = { user: "Property Approved" };

let subjectForForgotPassword = "Password Changed";

let slugifyOptions = {
    replacement: '-',  // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true,      // convert to lower case, defaults to `false`
    strict: false,     // strip special characters except replacement, defaults to `false`
    locale: 'en',       // language code of the locale to use
    trim: true         // trim leading and trailing replacement chars, defaults to `true`
  };

module.exports = {
  nodemailerAuth,
  nodemailerAuthNewsletter,
  emailFrom,
  emailFromNewsletter,
  emailTo,
  subject,
  rescheduledSubject,
  subjectForAddingProperty,
  subjectForApprovedProperty,
  subjectForForgotPassword,
  subjectForDeletingProperty,
  slugifyOptions
};
