if (window.location.pathname.match("/news")) {
  $(".navbar-nav .nav-item #nav-news").css({ color: "#28a745" });
}
if (window.location.pathname.match("/sellyourproperty")) {
  $(".navbar-nav .nav-item #nav-sell-your-property").css({ color: "#28a745" });
}

$(window).scroll(function () {
  var scroll = $(window).scrollTop();
  //console.log(scroll);
  if (scroll >= 1500) {
    //console.log('a');
    $(".quriobotWidgetContainer").addClass("noshow");
  } else {
    //console.log('a');
    $(".quriobotWidgetContainer").removeClass("noshow");
  }
});

$(".navbar-toggler").click(function () {
  $(".navbar-nav").toggleClass("show-me");
  $(".navbar-collapse").toggleClass("show-me-22");
});

// $(document).ready(function(){
//   $(".icon_btn").click(function(){
//   $("body").toggleClass("no_sroll");
// });
// });

$(".home-owl-carousel").owlCarousel({
  margin: 10,
  autoplay: true,
  loop: true,
  autoplayTimeout: 3000,
  autoplayHoverPause: true,
  responsiveClass: true,
  responsive: {
    0: {
      items: 1,
      nav: false,
      dots: true,
    },
    600: {
      items: 2,
      nav: false,
      dots: true,
    },
    1000: {
      items: 3,
      nav: false,
      loop: true,
      margin: 0,
    },
  },
});

$(".cities-owl-carousel").owlCarousel({
  margin: 10,
  autoplay: true,
  loop: true,
  autoplayTimeout: 3000,
  autoplayHoverPause: true,
  responsiveClass: true,
  responsive: {
    0: {
      items: 2,
      nav: false,
      dots: true,
    },
    600: {
      items: 2,
      nav: false,
      dots: true,
    },
    1000: {
      items: 4,
      nav: false,
      loop: true,
      margin: 0,
    },
  },
});

$(".home-owl-carousel-result").owlCarousel({
  margin: 30,
  autoplay: true,
  loop: true,
  autoplayTimeout: 3000,
  autoplayHoverPause: true,
  responsiveClass: true,
  dots: true,
  responsive: {
    0: {
      items: 1,
      nav: false,
    },
    600: {
      items: 2,
      nav: false,
    },
    1000: {
      items: 4,
      nav: false,
      loop: true,
      margin: 0,
    },
  },
});

$(".home-owl-carousel-result-property").owlCarousel({
  margin: 30,
  autoplay: true,
  loop: true,
  autoplayTimeout: 3000,
  autoplayHoverPause: true,
  responsiveClass: true,
  dots: true,
  responsive: {
    0: {
      items: 1,
      nav: false,
    },
    600: {
      items: 2,
      nav: false,
    },
    1000: {
      items: 2,
      nav: false,
      loop: true,
      margin: 0,
    },
  },
});

$(".allProp-first-owl").owlCarousel({
  margin: 15,
  autoplay: true,
  loop: true,
  nav: false,
  dots: true,
  autoplayTimeout: 3000,
  autoplayHoverPause: true,
  responsiveClass: true,
  responsive: {
    0: {
      items: 1,
    },
    600: {
      items: 1,
    },
    1000: {
      items: 1,
    },
  },
});

$(window).scroll(function () {
  var scroll = $(window).scrollTop();

  if (scroll >= 300) {
    $(".right-fixed").addClass("showme");
    $(".side-agent").addClass("showme2");
  } else {
    $(".right-fixed").removeClass("showme");
    $(".side-agent").removeClass("showme2");
  }
});

$(".open-form").click(function () {
  $(".form-mobile-only").addClass("show-form");
  $(".header").addClass("hide");
});
$(".back-arrow").click(function () {
  $(".form-mobile-only").removeClass("show-form");
  $(".header").removeClass("hide");
});

$(".side-agent").click(function () {
  $(".side-agent").toggleClass("showagent");
});

$(".navbar-toggler").click(function () {
  setTimeout(function () {
    $(".navbar-toggler").toggleClass("cross-menu");
  }, 500);
});

$(document).ready(function () {
  $(document).click(function (event) {
    var clickover = $(event.target);
    var _opened = $(".navbar-collapse").hasClass("show");
    if (_opened === true && !clickover.hasClass("navbar-toggle")) {
      $("button.navbar-toggler").click();
    }
  });
});

// stick search

$(window).scroll(function () {
  var scroll = $(window).scrollTop();
  if (scroll >= 1) {
    $(".topserach-sticky").addClass("searchstricky");
  } else {
    $(".topserach-sticky").removeClass("searchstricky");
  }
});

var propertyPageCarouselInit = function () {
  $(".allProp-first-owl").owlCarousel({
    loop: true,
    margin: 10,
    autoplay: true,
    autoplayTimeout: 5000,
    dots: true,
    autoplayHoverPause: true,
    responsiveClass: true,
    responsive: {
      0: {
        items: 1,
        nav: false,
        margin: 0,
        dots: true,
      },
      600: {
        items: 1,
        nav: false,
        margin: 0,
        dots: true,
      },
      1000: {
        items: 1,
        nav: false,
        dots: true,
        margin: 0,
        loop: true,
      },
    },
  });
};

$(".allProp-first-owl-property").owlCarousel({
  loop: true,
  margin: 10,
  autoplay: true,
  autoplayTimeout: 5000,
  dots: false,
  autoplayHoverPause: true,
  responsiveClass: true,
  responsive: {
    0: {
      items: 1,
      nav: false,
      margin: 0,
      dots: false,
    },
    600: {
      items: 1,
      nav: false,
      margin: 0,
      dots: false,
    },
    1000: {
      items: 1,
      nav: false,
      dots: false,
      margin: 0,
      loop: true,
    },
  },
});

propertyPageCarouselInit();

var customcount = 0;
var screenWidth = $(window).width();

var handle_view_change_v1 = function (name) {
  filter_state["view"] = name;
  currentView = name;
  // Change the cureent View
  if (name == "partial") {
    $('a[href="#pills-folder"]').tab("show");
  } else if (name == "map") {
    $('a[href="#pills-gps"]').tab("show");
  } else if (name == "card") {
    $('a[href="#pills-list"]').tab("show");
  } else if (name == "table") {
    $('a[href="#pills-grid"]').tab("show");
  }
  if (screenWidth < 500 && name == "partial") {
    mobileViewHandlingV1();
  }
};

$('a[data-toggle="pill"]').on("shown.bs.tab", function (e) {
  window.markers = [];
  let id = e.target.id;
  let targetView = "";
  if (id === "pills-folder-tab") targetView = "partial";
  if (id === "pills-gps-tab") targetView = "map";
  if (id === "pills-list-tab") targetView = "card";
  if (id === "pills-grid-tab") targetView = "table";
  if (targetView) {
    currentView = targetView;
    filter_state["view"] = targetView;
    if (targetView == "partial" && typeof filter_state !== "undefined") {
      initMap();
    }
    if (targetView == "map") {
      initMap("full_map");
    }
  }
});

$(".sim-prop-owl").owlCarousel({
  margin: 15,
  autoplay: true,
  loop: true,
  nav: false,
  dots: false,
  autoplayTimeout: 3000,
  autoplayHoverPause: true,
  responsiveClass: true,
  responsive: {
    0: {
      items: 1,
    },
    600: {
      items: 1,
    },
    1000: {
      items: 1,
    },
  },
});

function showhidefilter(selector) {
  $("#" + selector)
    .parent()
    .toggleClass("filters-hide", 1000);
}

function mobileViewHandlingV1() {
  if (screenWidth < 767) {
    current_view = "card";
    handle_view_change_v1("card");
    $('a[href="#pills-list"]').tab("show");
  }
}
// Show Previous and Next PDF
function show_pdf(url, wrapper, dataTarget, topWrapper, current, embedId) {
  console.log("url, wrapper, dataTarget", dataTarget, wrapper)
  $("#" + embedId +"-canvas").attr("data-target", "#" + dataTarget)
  $("#" + topWrapper +" button.btn").removeClass("active");
  $("#" + current).addClass("active");

  //Set Embed src
  // var frame= document.getElementById(embedId);
  // var clone=frame.cloneNode(true);
  // clone.setAttribute('src', url);
  // frame.parentNode.replaceChild(clone,frame)
  showPDF(embedId +"-canvas", window.location.origin +  url, embedId)
}

// Show Previous and Next PDF
// function show_pdf(url, wrapper, dataTarget, topWrapper, current, embedId, i, totoalI) {
//   // console.log("url, wrapper, dataTarget", embedId);
//   // $("#" + wrapper + " .pdf-overlay").attr("data-target", "#" + dataTarget);
//   $('#'+wrapper+' *').css("display", "none");
//   $('#'+wrapper+'-'+(i)).css("display", "block");
//   $('#'+wrapper+'-'+(i)+' *').css("display", "block");
//   $('#'+wrapper+'-'+(i)+' script').css("display", "none");
//   console.log('#'+wrapper+'-'+(i))

  
//   $("#" + topWrapper + " button.btn").removeClass("active");
//   $("#" + current).addClass("active");

//   //Set Embed src
//   // var frame = document.getElementById(embedId);
//   // var clone = frame.cloneNode(true);
//   // clone.setAttribute("src", url);
//   // frame.parentNode.replaceChild(clone, frame);
// }

const $formLoanProject = $("#loan-project-form");

$formLoanProject.on("submit", loanProjectSubmitHandler);

function loanProjectSubmitHandler(e) {
  e.preventDefault();

  var loanProjectData = {};
  loanProjectData.project = document.getElementById("loan-project").value;
  loanProjectData.user    = document.getElementById("loan-project-user").value;
  loanProjectData.phone   = document.getElementById("loan-project-phone").value;
  loanProjectData.countryCode = document.getElementById('loan-project-code').value;
  loanProjectData.countryName = document.getElementById('loan-project-code-name').value;
  loanProjectData.email   = document.getElementById("loan-project-email").value;
  loanProjectData.bank    = document.getElementById("loan-project-bank").value;
  let sendNewsletter = document.getElementById('newsletter-check-project');
  loanProjectData.newsletter = sendNewsletter.checked;
  
  console.log("loanProjectData", loanProjectData);
  if (loanProjectData.user == "") {
    customAlert("Please provide your name.");
    return;
  }

  if (loanProjectData.phone.length < 1 && loanProjectData.email.length < 1) {
    customAlert("Either email or Phone is mandatory");
    return;
  }
  if (loanProjectData.email){
    const regExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    const match = loanProjectData.email.match(regExp);
    console.log(match)
    if (!match){
        customAlert("Invalid Email");
        vm.loader = false;
        return;
    }else{
        console.log("valid email");
    }
}
if (loanProjectData.phone){
    // const regExp = /((\+*)((0[ -]*)*|((91 )*))((\d{12})+|(\d{10})+))|\d{5}([- ]*)\d{6}/g
    // const match = loanProjectData.phone.match(regExp);
    // if (!match){
    //   customAlert("Invalid Phone Number");
    //   vm.loader = false;
    //   return;
    // }

    let ph = {number:loanProjectData.countryCode+loanProjectData.phone}
    console.log(ph);

    $.post("/api/validatePhoneNumber", ph, function (data) {
      console.log(data)
      if (data.valid) {
        //change the phone number to the number sent from api
        loanProjectData.phone = data.valid;
        $.post("/api/loanProject/add", loanProjectData, function (data) {
          if (data.success) {
            customAlert(data.message, data.title);
            $('#loan-project-form').trigger('reset')
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

$("#openSignupModal").on("click", function (e) {
  e.preventDefault();
  $("#loginModal").modal("hide");
  $("#signupModal").modal("show");
});

$("#openLoginPopup").on("click", function (e) {
  e.preventDefault();
  $("#loginModal").modal("show");
  $("#signupModal").modal("hide");
});

$(".digit-group")
  .find("input")
  .each(function () {
    $(this).attr("maxlength", 1);
    $(this).on("keyup", function (e) {
      if (e.keyCode === 8 || e.keyCode === 37) {
        var prev = $("input#" + $(this).data("previous"));
        if (prev.length) {
          $(prev).select();
        }
      } else if (
        (e.keyCode >= 48 && e.keyCode <= 57) ||
        (e.keyCode >= 65 && e.keyCode <= 90) ||
        (e.keyCode >= 96 && e.keyCode <= 105) ||
        e.keyCode === 39
      ) {
        var next = $("input#" + $(this).data("next"));
        if (next.length) {
          $(next).select();
        }
      }
    });
  });

$(".project-filter .dropdown-menu").on("click", function (event) {
  // The event won't be propagated up to the document NODE and
  // therefore delegated events won't be fired
  event.stopPropagation();
});

addToCompareSelected = false;
entityToCompare = [];
function add_to_compare(project, id) {
  project = JSON.parse(project);
  console.log(project)
  console.log(project.id)
  if (project.location_type)
    project.id = project.id+"-"+project.location_type
  console.log(project)
  console.log(id)
  
  console.log("project", project);
  console.log(entityToCompare)
  let checked = id
    ? $(`#${id}`)[0].checked
    : $(`#example-${project.id}`)[0].checked;

  console.log("checked", checked);
  // console.log(`#example-${project.id}-card-view`)
  if (checked === true) {
    $(`#example-${project.id}`)[0].checked = true;
    if ($(`#example-${project.id}-card-view`)[0])
      $(`#example-${project.id}-card-view`)[0].checked = true;
    if (
      entityToCompare.findIndex(function (ele) {
        return ele.url === project.url;
      }) === -1
    ) {
      entityToCompare.push(project);
    }
  } else if (checked === false) {
    $(`#example-${project.id}`)[0].checked = false;
    if ($(`#example-${project.id}-card-view`)[0])
      $(`#example-${project.id}-card-view`)[0].checked = false;
    entityToCompare.splice(
      entityToCompare.findIndex(function (ele) {
        return ele.url === project.url;
      }),
      1
    );
  } else {
    entityToCompare.splice(
      entityToCompare.findIndex(function (ele) {
        return ele.url === project.url;
      }),
      1
    );
  }

  if (entityToCompare.length > 0) {
    $(".compare").removeClass("d-none");
  } else {
    $(".compare").addClass("d-none");
  }
}

function showCompareResult() {
  $('#you-can-compare-message').hide()
  table_rows = entityToCompare;
  create_table_body();
  handle_view_change_v1("table");
  $("#pagination-demo").addClass("d-none");
  // $('.compare').addClass("d-none");
  addToCompareSelected = true;
  $(".apart-table").addClass("comapre-entity");
}

function handleChangeCategory(id) {
  let checked = $(`#${id}`)[0].checked;
  if (checked) {
    let checkboxes = $(`#ul-${id} input[type="checkbox"]`);
    checkboxes.each(function () {
      console.log("This", $(this)[0].checked);
      if (!$(this)[0].checked) {
        $(this).trigger("onchange");
      }
    });
    $(`#ul-${id} input[type="checkbox"]`).prop("checked", true);
    $(`#ul-${id}`).removeClass("d-none");
  } else {
    let checkboxes = $(`#ul-${id} input[type="checkbox"]`);
    checkboxes.each(function () {
      console.log("This", $(this)[0].checked);
      if ($(this)[0].checked) {
        $(this).trigger("onchange");
      }
    });
    $(`#ul-${id} input[type="checkbox"]`).prop("checked", false);
  }
}

function showHideSubCat(id) {
  console.log("id", id);
  $(`#ul-${id}`).toggleClass("d-none");
}
