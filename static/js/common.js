let toggleMobSeach = function () {
  $("#mob-seach").toggle();
};

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

$("#search_category_dropdown a").on("click", function () {
  $("#search_category_select").html($(this).html());
});

let search_fields = function () {
  category_mapping = {
    "All Categories": "/results",
    "All Properties": "/properties",
    "All Projects": "/projects",
    "All Builders": "/builders",
    "All Locations": "/locations",
    "All Authorities": "/authorities",
    "All Banks": "/banks",
  };
  category = $("#search_category_select").html().trim();
  if (category in category_mapping) {
    url = category_mapping[category];
  }
  let data = $("#type-ahead-search .typeahead").val();
  window.location = url + "?q=" + data;
};

let search_fields_v1 = function () {
  let data = $("#type-ahead-search .typeahead").val();
  window.location = window.location.pathname + "?q=" + data;
};

let go_to_page = function (url, samePage, cityName, assign) {
  // console.log("url-------", url, " ", cityName);

  if (cityName) {
    window.open(url + cityName, "_blank");
  } else {
    if (samePage == true) {
      window.location = url;
    }
    window.open(url, "_blank");
  }
};
$("#type-ahead-search").bind("typeahead:selected", function (obj, datum, name) {
  window.location = datum.url;
});
let changeFilterText = function () {
  text = $("#filter_text").html();
  if (text == "Show Filters") {
    $("#filter_text").html("Hide Filters");
  } else {
    $("#filter_text").html("Show Filters");
  }
};
$("#type-ahead-search .typeahead").typeahead(
  {
    hint: false,
    highlight: true,
    minLength: 0,
  },
  {
    name: "real-estate",
    display: "name",
    source: function (query, syncResults, asyncResults) {
      if (query.length > 0) {
        $.post("/api/search/v1", { data: query }, function (data) {
          asyncResults(data.results);
        });
      } else {
        syncResults([
          { name: "All Properties", url: "/properties" },
          { name: "All Projects", url: "/projects" },
          { name: "All Builders", url: "/builders" },
          { name: "All Locations", url: "/locations" },
          { name: "All Authorities", url: "/authorities" },
          { name: "All Banks", url: "/banks" },
        ]);
      }
    },
    templates: {
      suggestion: function (data) {
        result = "<div>" + data.name || data.heading;
        if ("doc_type" in data) {
          if ("location_type" in data) {
            result +=
              '<p class="entity__type_suggestions">' +
              data.location_type +
              "</p>";
          } else {
            result +=
              '<p class="entity__type_suggestions">' + data.doc_type + "</p>";
          }
        }
        result += "</div>";
        return result;
      },
    },
    limit: 6,
  }
);

// Login and Signup Code
var verifyOtp = function () {
  let otp = $("#signup_otp").val();
  $.post(
    "/api/customer/signUp",
    { mobile: userid, otp: otp, password: password },
    function (data) {
      if (data.success) {
        location.reload();
      } else {
        $("#login_pane").css("display", "block");
        $("#login_otp_pane").css("display", "none");
        customAlert(data.message);
      }
    }
  );
};

var validateOtpInput = function (event, id) {
  if (event.isComposing || event.keyCode === 229) {
    return;
  }
  let otpval = $(`#${id}`).val();
  let otpfield = document.querySelector(`#${id}`);
  console.log(otpval);

  console.log(event.keyCode);
  console.log(otpval.length);

  if (otpval.length <= 4) {
    if (event.keyCode >= 48 && event.keyCode <= 57) {
      console.log("Correct Key");
      // otpfield.value = otpfield.value.replaceevent.key;
    } else {
      otpfield.value = otpval.substring(0, 4);
    }
  } else {
    otpfield.value = otpval.substring(0, 4);
  }
};

var verifyOtpV1 = function () {
  let otp = "";
  if (window.innerWidth >= 576) {
    let d1 = $("#digit-1").val();
    let d2 = $("#digit-2").val();
    let d3 = $("#digit-3").val();
    let d4 = $("#digit-4").val();
    otp = d1 + d2 + d3 + d4;
  } else {
    otp = $("#otpInput3").val();
  }

  if (otp.length !== 4) {
    customAlert("Invalid OTP.");
  }
  $.post(
    "/api/customer/signUp",
    { mobile: userid, otp: otp, password: password },
    function (data) {
      if (data.success) {
        location.reload();
      } else {
        $("#login_pane").css("display", "block");
        $("#login_otp_pane").css("display", "none");
        customAlert(data.message);
      }
    }
  );
};

// var usernameForForgotPassword = function () {
//   $("#login_modal_login_pane").css("display", "none");
//   $("#forgot_password_username_pane").css("display", "block");
// };

var verifyOtpForForgotPassword = function () {
  userid = document.getElementById("forgot_password_username").value;
  let otp = "";
  if (window.innerWidth >= 576) {
    let d1 = $("#number-1").val();
    let d2 = $("#number-2").val();
    let d3 = $("#number-3").val();
    let d4 = $("#number-4").val();
    otp = d1 + d2 + d3 + d4;
  } else {
    otp = $("#otpInput1").val();
  }

  if (otp.length !== 4) {
    customAlert("Invalid OTP.");
  } else {
    $.post(
      "/api/customer/resetPasswordOtpValidate",
      { mobile: userid, otp: otp },
      function (data) {
        if (data.success) {
          // console.log("+++++++++++You got here+++++++++++++++++++");
          $("#forgot_password_otp_pane").css("display", "none");
          $("#forgot_password_pane").css("display", "block");
        } else {
          customAlert("Invalid OTP");
        }
      }
    );
  }
};

var userForgotPassword = function () {
  userid = document.getElementById("forgot_password_username").value;
  let patt = new RegExp("^[5-9][0-9]{9}$");
  if (!patt.test(parseInt(userid))) {
    customAlert("Invalid Mobile Number");
    return;
  }
  $.post(
    "/api/customer/sendOtpPasswordReset",
    { mobile: userid },
    function (data) {
      if (data.success) {
        $("#forgot_password_username_pane").css("display", "none");
        $("#forgot_password_otp_pane").css("display", "block");
      } else {
        customAlert("Something went wrong");
      }
    }
  );
};

var userForgotPassword1 = function () {
  let username = document.getElementById("forgot_password_username").value;
  let password = $("#forgot_password").val();
  let password_re = $("#forgot_password_re").val();
  let patt = new RegExp("^[5-9][0-9]{9}$");
  let passvalid = new RegExp(
    "^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$"
  );
  if (!passvalid.test(password)) {
    customAlert(
      "*Enter complex password to continue: Your Password must be a minimum length of 6 and max of 16 characters, consisting atleast one of each - Uppercase(A-Z), Lowercase(a-z), Numeric characters(0-9) and Special character (!@#$%^&*)"
    );
    return;
  } else if (password != password_re) {
    customAlert("Passwords do not match");
    return;
  } else {
    $.post(
      "/api/customer/reset_password",
      { username: username, password: password },
      function (data) {
        if (data) {
          customAlert(
            "Your password has been changed successfully. Please try login."
          );
          $("#forgot_password_pane").css("display", "none");
          $("#login_modal_login_pane").css("display", "block");
        } else {
          customAlert("Something Went wrong");
        }
      }
    );
  }
};

var userSignUp = function () {
  userid = $("#signup_contact_number").val();
  password = $("#signup_password").val();
  let password_re = $("#signup_password_re").val();
  let patt = new RegExp("^[5-9][0-9]{9}$");
  // let passvalid = new RegExp(
  //   "^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$"
  // );
  let passvalid = new RegExp("^[a-zA-Z0-9]{6,16}$");
  if (!patt.test(parseInt(userid))) {
    customAlert("Invalid Mobile Number");
    return;
  }
  if (!passvalid.test(password)) {
    // customAlert(
    //   "*Enter complex password to continue: Your Password must be a minimum length of 6 and max of 16 characters, consisting atleast one of each - Uppercase(A-Z), Lowercase(a-z), Numeric characters(0-9) and Special character (!@#$%^&*)"
    // );
    customAlert(
      "Your Password must be a minimum length of 6 and max of 16 characters"
    );
    return;
  }
  if (password != password_re) {
    customAlert("Passwords do not match");
    return;
  }
  $.post("/api/customer/sendOtp", { mobile: userid }, function (data) {
    if (data.success) {
      $("#login_pane").css("display", "none");
      $("#login_otp_pane").css("display", "block");
    } else {
      customAlert("Something went wrong");
    }
  });
};

var resendOtp = function () {
  $.post("/api/customer/sendOtp", { mobile: userid }, function (data) {
    if (data.success) {
      $("#login_pane").css("display", "none");
      $("#login_otp_pane").css("display", "block");
    } else {
      customAlert("Something went wrong");
    }
  });
};
var userLogin = function (comingFromProfile = false) {
  let userid = $("#login_contact_number").val();
  let country_code = $('#login-code').val();
  let country_name = $('#login-code-name').val();
  
  let password = $("#login_password").val();
  let patt = new RegExp("^[5-9][0-9]{9}$");
  if (!patt.test(parseInt(userid))) {
    customAlert("Invalid Mobile Number");
    return;
  }

  let viewHistory = window.localStorage.getItem("userVwH");
  let searchHistory = window.localStorage.getItem("userSrchH");

  // console.log(viewHistory);
  // console.log(searchHistory);
  // console.log({
  //   userid: userid,
  //   password: password,
  //   viewHistory,
  //   searchHistory,
  // });

  let gtp = window.localStorage.getItem("gtp");
  $('#login-button').attr('disabled', 'disabled');
  $('#login-button-whatsapp').attr('disabled', 'disabled');

  $.post(
    "/api/customer/logIn",
    { userid: userid, password: password, viewHistory, searchHistory, country_code, country_name, gtp },
    function (data) {
      if (data.success) {
        window.localStorage.removeItem("userVwH");
        window.localStorage.removeItem("userSrchH");
        if (gtp === "true") {
          window.localStorage.removeItem("gtp");
        }
        // if (location.pathname === '/sellyourproperty'){
        //   location.replace(location.origin+'/profile'+'#sellyourproperty')
        // }else{
        //   location.reload();
        // }
        if (gtp === "true") {
          $('#login-button').html('Success! Taking you to profile page');
          window.localStorage.removeItem("gtp");
          location.replace(location.origin+'/profile');
        } else {
          location.reload();
        }
      } else {
        customAlert(data.message);
        $('#login-button').removeAttr('disabled');
      }
    }
  );
};

// LOAN REQUEST FORM
const $formLoan = $("#loan-form");

$formLoan.on("submit", loanSubmitHandler);

function loanSubmitHandler(e) {
  e.preventDefault();

  var loanData = {};
  (loanData.user = document.getElementById("loan-user").value),
  (loanData.project = document.getElementById("loan-project").value),
  (loanData.phone = document.getElementById("loan-phone").value),
  (loanData.countryCode = document.getElementById("loan-code").value),
  (loanData.countryName = document.getElementById("loan-code-name").value),
  (loanData.email = document.getElementById("loan-email").value),
  (loanData.bank = document.getElementById("loan-bank").value);
  let sendNewsletter = document.getElementById("newsletter-check-bank");
  loanData.newsletter = sendNewsletter.checked;

  console.log("loanData", loanData);

  if (loanData.user == "") {
    customAlert("Please provide your name.");
    return;
  }

  if (loanData.phone.length < 1 && loanData.email.length < 1) {
    customAlert("Either email or Phone is mandatory");
    return;
  }
  if (loanData.email) {
    const regExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const match = loanData.email.match(regExp);
    console.log(match);
    if (!match) {
      customAlert("Invalid Email");
      vm.loader = false;
      return;
    } else {
      console.log("valid email");
    }
  }
  if (loanData.phone) {
    // const regExp =
    //   /((\+*)((0[ -]*)*|((91 )*))((\d{12})+|(\d{10})+))|\d{5}([- ]*)\d{6}/g;
    // const match = loanData.phone.match(regExp);
    // if (!match) {
    //   customAlert("Invalid Phone Number");
    //   vm.loader = false;
    //   return;
    // }

    let ph = {number:loanData.countryCode+loanData.phone}
    console.log(ph);

    $.post("/api/validatePhoneNumber", ph, function (data) {
    console.log(data)
    if (data.valid) {
        //change the phone number to the number sent from api
        loanData.phone = data.valid;
        $.post("/api/loanProject/add", loanData, function (data) {
          if (data.success) {
            document.getElementById("loan-user").value = "";
            document.getElementById("loan-phone").value = "";
            document.getElementById("loan-email").value = "";
            customAlert(data.message, data.title);
          } else {
            customAlert(data.message);
          }
        });
    } else {
        customAlert("Your phone number is invalid");
        console.log("in valid")
        return;
    }
    });
  }
}

// CONSULTATION FORM
const $form = $("#consult-form");

$form.on("submit", submitHandler);

function submitHandler(e) {
  e.preventDefault();
  var consultData = {};
  consultData.name = document.getElementById("consult-user").value;
  consultData.phone = document.getElementById("consult-phone").value;
  consultData.countryCode = document.getElementById("consult-phone-code").value;
  consultData.countryName = document.getElementById("consult-phone-code-name").value;
  consultData.email = document.getElementById("consult-email").value;
  consultData.lookingFor = document.getElementById("consult-looking-for").value;
  consultData.city = document.getElementById("consult-city").value;
  consultData.type_of_user = document.getElementById("consult-user-type").value;
  let nl = document.getElementById("newsletter-check");
  consultData.newsletter = nl.checked;

  if (
    consultData.name === "" ||
    consultData.phone === "" ||
    consultData.email === "" ||
    consultData.lookingFor === "" ||
    consultData.lookingFor === "Looking For" ||
    consultData.city === "" ||
    consultData.city === "City" ||
    consultData.type_of_user === "" ||
    consultData.type_of_user === "User Type"
  ) {
    customAlert("Please fill all the fields.");
    return;
  }
  if (consultData.email) {
    const regExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const match = consultData.email.match(regExp);
    console.log(match);
    if (!match) {
      customAlert("Invalid Email");
      vm.loader = false;
      return;
    } else {
      console.log("valid email");
    }
  }
  if (consultData.phone) {
    // const regExp =
    //   /((\+*)((0[ -]*)*|((91 )*))((\d{12})+|(\d{10})+))|\d{5}([- ]*)\d{6}/g;
    // const match = consultData.phone.match(regExp);
    // if (!match) {
    //   customAlert("Invalid Phone Number");
    //   vm.loader = false;
    //   return;
    // }

    let ph = {number:consultData.countryCode+consultData.phone}
    console.log(ph)

    $.post("/api/validatePhoneNumber", ph, function (data) {
      console.log(data)
      if (data.valid) {
        //change the phone number to the number sent from api
        consultData.phone = data.valid;
        $.post("/api/consult/add", consultData, function (data) {
          if (data.success) {
            customAlert(data.message, data.title);
            $("#consult-form")[0].reset();
            $("#FDPModal").modal("hide");
          } else {
            customAlert(data.message);
          }
        });
      } else {
        customAlert("Your phone number is invalid");
        console.log("in valid")
        return;
      }
    });
  }
}

// Schedule FORM
const $scheduleVisitForm = $("#schedule-visit-form");
const $scheduleVisitFormListingSCD3 = $("#schedule-visit-form-listing-SCD3");

$scheduleVisitForm.on("submit", scheduleVisitSubmitHandler);
$scheduleVisitFormListingSCD3.on("submit", scheduleVisitSubmitHandlerListingSCD3);

function scheduleVisitSubmitHandler(e) {
  e.preventDefault();
  // customAlert("you got here");
  var scheduleData = {};
  scheduleData.name = document.getElementById("schedule-name").value;
  scheduleData.countryCode = document.getElementById("schedule-phone-code").value;
  scheduleData.countryName = document.getElementById("schedule-phone-code-name").value;
  scheduleData.phone = document.getElementById("schedule-phone").value;
  scheduleData.email = document.getElementById("schedule-email").value;
  scheduleData.date = document.getElementById("schedule-date").value;
  scheduleData.timeZone = document.getElementById("schedule-time").value;
  if (document.getElementById("interested-other-projects")) {
    scheduleData.interestedInOtherProjects = document.getElementById(
      "interested-other-projects"
    ).value;
    if (
      scheduleData.interestedInOtherProjects === "Interested in other Projects"
    ) {
      scheduleData.interestedInOtherProjects = "";
    }
  } else {
    scheduleData.interestedInOtherProjects = "";
  }

  if (
    document.getElementById("schedule-project") &&
    document.getElementById("schedule-url")
  ) {
    scheduleData.project = document.getElementById("schedule-project").value;
    scheduleData.url = document.getElementById("schedule-url").value;
  } else {
      scheduleData.project = entityToCompare.map((e) => e.name).join(",");
      scheduleData.url = entityToCompare.map((e) => e.url).join(",");
  }

  if (
    scheduleData.name == "" ||
    scheduleData.phone == "" ||
    scheduleData.email == "" ||
    scheduleData.date == "" ||
    scheduleData.timeZone == "" ||
    scheduleData.timeZone === "0"
  ) {
    customAlert("Please fill all the fields.");
    return;
  }
  if (scheduleData.email) {
    const regExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const match = scheduleData.email.match(regExp);
    console.log(match);
    if (!match) {
      customAlert("Invalid Email");
      vm.loader = false;
      return;
    } else {
      console.log("valid email");
    }
  }
  if (scheduleData.phone) {
    // const regExp =
    //   /((\+*)((0[ -]*)*|((91 )*))((\d{12})+|(\d{10})+))|\d{5}([- ]*)\d{6}/g;
    // const match = scheduleData.phone.match(regExp);
    // if (!match) {
    //   customAlert("Invalid Phone Number");
    //   vm.loader = false;
    //   return;
    // }
    let ph = {number:scheduleData.countryCode+scheduleData.phone}
    console.log(ph);

    $.post("/api/validatePhoneNumber", ph, function (data) {
      console.log(data)
      if (data.valid) {
        //change the phone number to the number sent from api
        scheduleData.phone = data.valid;
        let nl = document.getElementById("newsletter-check-sv");
        console.log({ nl });
        scheduleData.newsletter = nl.checked;
        console.log(scheduleData);

        $.post("/api/schedule/add", scheduleData, function (data) {
          if (data.success) {
            console.log(data);
            scheduleUrlSCD3 = "";
            scheduleProjectSCD3 = "";
            window.location.replace(data.redirect_url+"?backTo="+window.location.pathname);
            // customAlert(data.message, data.title);
            // $("#schedule-visit-form")[0].reset();
            // $("#SCDVisitModal").modal("hide");
            // $("#SCD2VisitModal").modal("hide");
            // $("#SCD3VisitModal").modal("hide");
          } else {
            customAlert(data.message);
          }
        });
      } else {
        customAlert("Your phone number is invalid");
        console.log("in valid")
        return;
      }
    });
  }
}

function scheduleVisitSubmitHandlerListingSCD3(e) {
  console.log("I am in it");
  e.preventDefault();
  // customAlert("you got here");
  var scheduleData = {};
  scheduleData.name = document.getElementById("schedule-name-listing-SCD3").value;
  console.log(scheduleData);
  scheduleData.countryCode = document.getElementById("schedule-phone-code-listing-SCD3").value;
  console.log(scheduleData);
  scheduleData.countryName = document.getElementById("schedule-phone-code-name-listing-SCD3").value;
  console.log(scheduleData);
  scheduleData.phone = document.getElementById("schedule-phone-listing-SCD3").value;
  console.log(scheduleData);
  scheduleData.email = document.getElementById("schedule-email-listing-SCD3").value;
  console.log(scheduleData);
  scheduleData.date = document.getElementById("schedule-date-listing-SCD3").value;
  console.log(scheduleData);
  scheduleData.timeZone = document.getElementById("schedule-time-listing-SCD3").value;
  console.log(scheduleData);
  if (document.getElementById("interested-other-projects-listing-SCD3")) {
    scheduleData.interestedInOtherProjects = document.getElementById(
      "interested-other-projects-listing-SCD3"
    ).value;
    if (
      scheduleData.interestedInOtherProjects === "Interested in other Projects"
    ) {
      scheduleData.interestedInOtherProjects = "";
    }
  } else {
    scheduleData.interestedInOtherProjects = "";
  }

  if (scheduleProjectSCD3 !== "" && scheduleUrlSCD3 !== ""){
    scheduleData.project = scheduleProjectSCD3;
    scheduleData.url = scheduleUrlSCD3;
  }

  console.log(scheduleData);

  if (
    scheduleData.name == "" ||
    scheduleData.phone == "" ||
    scheduleData.email == "" ||
    scheduleData.date == "" ||
    scheduleData.timeZone == "" ||
    scheduleData.timeZone === "0"
  ) {
    customAlert("Please fill all the fields.");
    return;
  }
  if (scheduleData.email) {
    const regExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const match = scheduleData.email.match(regExp);
    console.log(match);
    if (!match) {
      customAlert("Invalid Email");
      vm.loader = false;
      return;
    } else {
      console.log("valid email");
    }
  }
  if (scheduleData.phone) {
    // const regExp =
    //   /((\+*)((0[ -]*)*|((91 )*))((\d{12})+|(\d{10})+))|\d{5}([- ]*)\d{6}/g;
    // const match = scheduleData.phone.match(regExp);
    // if (!match) {
    //   customAlert("Invalid Phone Number");
    //   vm.loader = false;
    //   return;
    // }
    let ph = {number:scheduleData.countryCode+scheduleData.phone}
    console.log(ph);

    $.post("/api/validatePhoneNumber", ph, function (data) {
      console.log(data)
      if (data.valid) {
        //change the phone number to the number sent from api
        scheduleData.phone = data.valid;
        let nl = document.getElementById("newsletter-check-sv-listing-SCD3");
        console.log({ nl });
        scheduleData.newsletter = nl.checked;
        console.log(scheduleData);

        $.post("/api/schedule/add", scheduleData, function (data) {
          if (data.success) {
            console.log(data);
            scheduleUrlSCD3 = "";
            scheduleProjectSCD3 = "";
            window.location.replace(data.redirect_url+"?backTo="+window.location.pathname);
            // customAlert(data.message, data.title);
            // $("#schedule-visit-form")[0].reset();
            // $("#SCDVisitModal").modal("hide");
            // $("#SCD2VisitModal").modal("hide");
            // $("#SCD3VisitModal").modal("hide");
          } else {
            customAlert(data.message);
          }
        });
      } else {
        customAlert("Your phone number is invalid");
        console.log("in valid")
        return;
      }
    });
  }
}

let scheduleProjectSCD3 = "";
let scheduleUrlSCD3 = "";
const triggerSCD3VisitModal = (dataName, dataUrl) => {
  scheduleProjectSCD3 = dataName;
  scheduleUrlSCD3 = dataUrl;
  console.log({dataName, dataUrl});
  $('#SCD3VisitModal').modal('show');
}


//Newsletter Form
const $newLetterForm = $("#newsletter-form");

$newLetterForm.on("submit", submitHandlerNewsLetter);

function submitHandlerNewsLetter(e) {
  e.preventDefault();
  var newsletter = {};
  newsletter.email = document.getElementById("newsletter-email").value;
  if (newsletter.email == "") {
    customAlert("Please fill all the fields.");
    return;
  }
  if (newsletter.email) {
    const regExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const match = newsletter.email.match(regExp);
    console.log(match);
    if (!match) {
      customAlert("Invalid Email");
      vm.loader = false;
      return;
    } else {
      console.log("valid email");
    }
  }

  $.post("/api/newsletter/add", newsletter, function (data) {
    if (data.success) {
      customAlert(data.message, data.title);
      $("#newsletter-form")[0].reset();
    } else {
      customAlert(data.message);
    }
  });
}

// var customCount =
//     $(document).ready(function () {
//         console.log("ready!");
//         if (screenWidth > 500) {
//             current_view = 'partial'
//             console.log('current_view', current_view);
//         }
//     });

var customcount = 0;
var screenWidth = $(window).width();
function mobileViewHandling() {
  // console.log('screenwidth mobileViewHandling', screenWidth)
  if (screenWidth < 500) {
    // console.log('inside if')
    current_view = "card";
    handle_view_change("card");
    // setTimeout(function() {
    //     console.log('calling timeout')
    // }, 10000)
  }
}

//  else {

// }

// handle_view_change(current_view)

// View Controls
var handle_view_change = function (name) {
  // console.log('handle view called', name);
  window.markers = [];
  if (name == "table") {
    $(".hide-sort").css("visibility", "visible");
  } else {
    $(".hide-sort").css("visibility", "visible");
  }
  current_view = name;
  // Reset Css
  $(".view-cntrl-btn").css("background-color", "transparent");
  $(".view-cntrl-btn").css("color", "#051d4d");

  // Highlight Selected
  $("#" + name + "-btn").css("background-color", "#051d4d");
  $("#" + name + "-btn").css("color", "white");

  // Flip Sections
  $(".result-section").css("display", "none");
  $("." + name + "-view").css("display", "flex");
  if (name == "partial" && typeof filter_state !== "undefined") {
    initMap();
  }

  $("#card-btm-btn").attr("disabled", "disabled").css({
    background: "grey",
    color: "#FFF",
  });
  $("#map-btm-btn").removeAttr("disabled", "disabled").css({
    background: "#051d4d",
    color: "#FFF",
  });

  if (name == "map") {
    initMap("full_map");
    // $('#map-btm-btn').attr("disabled", "disabled");
    $("#map-btm-btn").attr("disabled", "disabled").css({
      background: "grey",
      color: "#FFF",
    });
    $("#card-btm-btn").removeAttr("disabled", "disabled").css({
      background: "#051d4d",
      color: "#FFF",
    });
  }
  filter_state["view"] = name;
  currentView = name;

  // console.log('screenwidth name here0', screenWidth, name)
  if (screenWidth < 500 && name == "partial") {
    mobileViewHandling();
  }
};

// Warning : Filter Code Do not touch
var queryString = document.location.search;
if (queryString.length > 0) {
  filter_state = parseQueryStringToDictionary(queryString);
} else {
  filter_state = {};
}
function parseQueryStringToDictionary(queryString) {
  var dictionary = {};

  if (queryString.indexOf("?") === 0) {
    queryString = queryString.substr(1);
  }

  var parts = queryString.split("&");
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];
    var keyValuePair = p.split("=");

    var key = keyValuePair[0];
    var value = keyValuePair[1];

    value = decodeURIComponent(value);
    value = value.replace(/\+/g, " ");
    if (value != "q") {
      value = value.split(",");
    }

    dictionary[key] = value;
  }

  return dictionary;
}

var handleFilters = function (type, value) {
  // console.log('type', type)
  // console.log('value', value);
  console.log("type, value", type, value);
  if (!(type in filter_state)) {
    filter_state[type] = [];
  }
  if (filter_state[type].indexOf(value) > -1) {
    filter_state[type].splice(filter_state[type].indexOf(value), 1);
  } else {
    console.log(filter_state[type], type, value)
    if (!Array.isArray(filter_state[type])) {
      let x = filter_state[type];
      filter_state[type] = [];
      filter_state[type].push(x)
      console.log(filter_state[type], type, value)
    }
    console.log(filter_state[type], type, value)
    filter_state[type].push(value);
  }

  for (key in filter_state) {
    if (filter_state[key].length > 0) {
      let totalItems = filter_state[key];
      // For Property type hardcoaded check to show preselcted
      if (key === "type" && totalItems.length > 0) {
        //Checked all
        if (
          totalItems.indexOf("Apartments") !== -1 &&
          totalItems.indexOf("Residential Plots") !== -1 &&
          totalItems.indexOf("Villas") !== -1 &&
          totalItems.indexOf("Floors") !== -1 &&
          totalItems.indexOf("Penthouse") !== -1 &&
          totalItems.indexOf("Duplex") !== -1
        ) {
          var qucikele1 = document.getElementById("quick-category-1");
          if (qucikele1) qucikele1.checked = true;
        } else {
          var qucikele1 = document.getElementById("quick-category-1");
          if (qucikele1) qucikele1.checked = false;
        }

        if (
          totalItems.indexOf("Commercial Office") !== -1 &&
          totalItems.indexOf("Retail Shop") !== -1 &&
          totalItems.indexOf("Commercial Land") !== -1 &&
          totalItems.indexOf("Serviced Apartments") !== -1
        ) {
          var qucikele2 = document.getElementById("quick-category-2");
          if (qucikele2) qucikele2.checked = true;
        } else {
          var qucikele2 = document.getElementById("quick-category-2");
          if (qucikele2) qucikele2.checked = false;
        }

        if (
          totalItems.indexOf("Industrial Land") !== -1 &&
          totalItems.indexOf("Farm house") !== -1
        ) {
          var qucikele3 = document.getElementById("quick-category-3");
          if (qucikele3) qucikele3.checked = true;
        } else {
          var qucikele3 = document.getElementById("quick-category-3");
          if (qucikele3) qucikele3.checked = false;
        }
      } else {
        var qucikele1 = document.getElementById("quick-category-1");
        if (qucikele1) qucikele1.checked = false;

        var qucikele2 = document.getElementById("quick-category-2");
        if (qucikele2) qucikele2.checked = false;

        var qucikele3 = document.getElementById("quick-category-3");
        if (qucikele3) qucikele3.checked = false;
      }
    }
  }
};
function createElementFromHTML(htmlString) {
  var div = document.createElement("div");
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}
var check_and_create_filter = function (key, element) {
  // console.log('from check_and_create_filter')
  if (
    key == "city" ||
    key == "subcity" ||
    key == "district" ||
    key == "state"
  ) {
    var container_idx = "location" + "-filter-container";
  } else {
    var container_idx = key + "-filter-container";
  }
  // console.log('container id: ', container_idx)
  let idx = key + "-" + element.split(" ").join("-");
  idx = idx.toLowerCase();
  let ele = document.getElementById(container_idx);
  if (ele === undefined || ele === null) {
    return;
  }
  // console.log('key', key)
  // console.log('filter', element)
  let check_box_container =
    `<div class="d-flex flex-column bd-highlight mt-2">
                                <div class="pretty p-default">
                                    <input type="checkbox" id="` +
    idx +
    `" onchange="handleFilters('` +
    key +
    `','` +
    element +
    `')"  checked="checked"/>
                                    <div class="state">
                                        <label>` +
    element +
    `</label>
                                    </div>
                                </div>
                            </div>`;
  if (window.location.pathname !== "/projects") {
    // Because on project screen data comes from the database so should be called after getting the api response
    ele.appendChild(createElementFromHTML(check_box_container));
  }
};
var set_filters = function () {
  // console.log("set filters called");
  let counter = 0;
  let is_name_set = true;
  let set_name = "";
  for (key in filter_state) {
    console.log({key})
    if (filter_state[key].length > 0) {
      if (key == "sort") {
        let ele = document.getElementById("sort-filter");
        ele.value = filter_state[key][0];
      } else if (key != "q") {
        filter_state[key].forEach((element) => {
          counter += 1;
          let idx = key + "-" + element.split(" ").join("-");
          idx = idx.toLowerCase();

          // quick-filters-check
          ele = document.getElementById(idx);
          if (ele) {
            ele.checked = true;
            // console.log('in if set_filteers')
          } else {
            // console.log('in else set_filteers')
            check_and_create_filter(key, element);
          }

          // For quick Filters
          var quickEle = document.getElementById("quick-" + idx);
          if (quickEle) {
            quickEle.checked = true;
          }
        });
        //Show Selected count on quick filters
        // console.log(filter_state);
        if (filter_state[key].length > 0) {
          var containerClass = "";
          let length = filter_state[key].length;
          let totalItems = filter_state[key];
          // console.log("----------s-t-a-r-t-----------------");
          // console.log(filter_state, key);
          if (
            key == "city" ||
            key == "subcity" ||
            key == "district" ||
            key == "state"
          ) {
            containerClass = "location" + "-quick-count";
            length = 0;
            totalItems = [];
            if (filter_state["city"]) {
              length += filter_state["city"].length;
              totalItems = totalItems.concat(filter_state["city"]);
            }
            if (filter_state["subcity"]) {
              length += filter_state["subcity"].length;
              totalItems = totalItems.concat(filter_state["subcity"]);
            }
            if (filter_state["district"]) {
              length += filter_state["district"].length;
              totalItems = totalItems.concat(filter_state["district"]);
            }
            if (filter_state["state"]) {
              length += filter_state["state"].length;
              totalItems = totalItems.concat(filter_state["state"]);
            }
          } else {
            containerClass = key + "-quick-count";
          }
          console.log({key})
          if ( key === "bhk") {
            containerClass = "type" + "-quick-count";
          }
          // console.log("totalItems", totalItems);
          console.log({is_name_set})
          if (!is_name_set){
            if (totalItems.length === 1) {
              $("#" + containerClass).html(
                `<b>${filter_state[key]}</b> <span><span class="quick-filter-drp-count">${length}</span></span> <i class="fa fa-angle-down"></i>`
              );
              if (key !== 'view'){
                set_name = filter_state[key]
                is_name_set = true;
              }
            } else {
              $("#" + containerClass + " span").html(
                `<span class="quick-filter-drp-count">${length}</span>`
              );
            }
          } else {
            console.log(filter_state, key);
            if (key !== 'view'){
              console.log(set_name, filter_state, key);
              let name_to_set = filter_state[key];
              if (key === 'bhk'){
                name_to_set = name_to_set + ' BHK';
              }
              if (totalItems.length === 1) {
                console.log({name_to_set, containerClass})
                if (name_to_set){
                  $("#" + containerClass).html(
                  `<b>${name_to_set}</b> <span><span class="quick-filter-drp-count">${length}</span></span> <i class="fa fa-angle-down"></i>`
                );
                }
                set_name = filter_state[key]
                is_name_set = true;
              } else {
                $("#" + containerClass + " span").html(
                  `<span class="quick-filter-drp-count">${length}</span>`
                );
              }
            }            
          }
          

          $("#" + containerClass).addClass("active");
          // console.log(containerClass);
          // console.log("------------e-n-d-----------------");
          // For Property type hardcoaded check to show preselcted
          // console.log(totalItems)
          if (key === "type" && totalItems.length > 0) {
            if (
              totalItems.indexOf("Apartments") !== -1 ||
              totalItems.indexOf("Residential Plots") !== -1 ||
              totalItems.indexOf("Villas") !== -1 ||
              totalItems.indexOf("Floors") !== -1 ||
              totalItems.indexOf("Penthouse") !== -1 ||
              totalItems.indexOf("Duplex") !== -1
            ) {
              showHideSubCat("quick-category-1");
              showHideSubCat("category-1");
            }
            if (
              totalItems.indexOf("Commercial Office") !== -1 ||
              totalItems.indexOf("Retail Shop") !== -1 ||
              totalItems.indexOf("Commercial Land") !== -1 ||
              totalItems.indexOf("Serviced Apartments") !== -1
            ) {
              showHideSubCat("quick-category-2");
              showHideSubCat("category-2");
            }
            if (
              totalItems.indexOf("Industrial Land") !== -1 ||
              totalItems.indexOf("Farm house") !== -1
            ) {
              showHideSubCat("quick-category-3");
              showHideSubCat("category-3");
            }
            //Checked all
            if (
              totalItems.indexOf("Apartments") !== -1 &&
              totalItems.indexOf("Residential Plots") !== -1 &&
              totalItems.indexOf("Villas") !== -1 &&
              totalItems.indexOf("Floors") !== -1 &&
              totalItems.indexOf("Penthouse") !== -1 &&
              totalItems.indexOf("Duplex") !== -1
            ) {
              var qucikele1 = document.getElementById("quick-category-1");
              if (qucikele1) qucikele1.checked = true;

              var ele1 = document.getElementById("category-1");
              if (ele1) ele1.checked = true;
            }
            if (
              totalItems.indexOf("Commercial Office") !== -1 &&
              totalItems.indexOf("Retail Shop") !== -1 &&
              totalItems.indexOf("Commercial Land") !== -1 &&
              totalItems.indexOf("Serviced Apartments") !== -1
            ) {
              var qucikele2 = document.getElementById("quick-category-2");
              if (qucikele2) qucikele2.checked = true;

              var ele2 = document.getElementById("category-2");
              if (ele2) ele2.checked = true;
            }
            if (
              totalItems.indexOf("Industrial Land") !== -1 &&
              totalItems.indexOf("Farm house") !== -1
            ) {
              var qucikele3 = document.getElementById("quick-category-3");
              if (qucikele3) qucikele3.checked = true;

              var ele3 = document.getElementById("category-3");
              if (ele3) ele3.checked = true;
            }
          }
        }
      }
    }
  }

  if (counter > 0) {
    // changeFilterText();
    // $("#pageFilters").collapse("show");
  }
};
function generateUrl() {
  url = "";
  console.log("Filter state");
  for (key in filter_state) {
    console.log(filter_state, key);
    if (filter_state[key].length > 0) {
      url += "&" + key + "=";
      if (key != "q" && key != "view") {
        filter_state[key].forEach((element) => {
          url += element + ",";
        });
        url = url.slice(0, -1);
      } else {
        url += filter_state[key];
      }
    }
  }
  url = url.substr(1);
  // console.log('url :  ', url)
  window.location = document.location.pathname + "?" + url;
}
set_filters();

$("#sort-filter").on("change", function () {
  filter_state["sort"] = [this.value];
  generateUrl();
});

// table sort
var tableSort = function (val1, val2) {
  if ("sort" in filter_state) {
    if (filter_state["sort"][0] == val1) {
      filter_state["sort"][0] = val2;
    } else if (filter_state["sort"][0] == val2) {
      filter_state["sort"][0] = val1;
    }
  } else {
    filter_state["sort"] = [];
    filter_state["sort"].push(val1);
  }
  current_view = "table";
  handle_view_change(current_view);
  generateUrl("table");
};
// Filter Code Ends

// NewsCode

var news_search = function () {
  let search_term = $("#news_search").val();
  go_to_page("/news?q=" + search_term);
};
var bookmark_api = function (url, name, builder, id) {
  const type = url.split("/");
  const data = { url: url, name: name, builder: builder, type: type[1] };
  $.post("/api/customer/bookmark", data, function (data) {
    // console.log("***********",data);
    if (data.bookmark_limit_reached) {
      $(`.${id} .set_bookmark`).css("display", "inline-block");
      $(`.${id} .unset_bookmark`).css("display", "none");
      customAlert(data.message);
    }
    return;
  });
};
var set_bookmark = function () {
  $("#set_bookmark").css("display", "none");
  $("#unset_bookmark").css({ display: "inline-block", color: "#ffc107" });
  bookmark_api(window.location.pathname);
};
var unset_bookmark = function () {
  $("#set_bookmark").css("display", "inline-block");
  $("#unset_bookmark").css("display", "none");
  bookmark_api(window.location.pathname);
};

var set_bookmark_list = function (url, id, name, builder) {
  $(`.${id} .set_bookmark`).css("display", "none");
  $(`.${id} .unset_bookmark`).css({
    display: "inline-block",
    color: "#ffc107",
  });
  bookmark_api(url, name, builder, id);
};
var unset_bookmark_list = function (url, id, name, builder) {
  $(`.${id} .set_bookmark`).css("display", "inline-block");
  $(`.${id} .unset_bookmark`).css("display", "none");
  bookmark_api(url, name, builder);
};