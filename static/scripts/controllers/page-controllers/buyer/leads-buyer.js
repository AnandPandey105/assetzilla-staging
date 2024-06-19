(function () {
  "use strict";
  angular.module("app").controller("LeadsBuyerCtrl", LeadsBuyerCtrl);

  LeadsBuyerCtrl.$inject = [
    "$scope",
    "$http",
    "$rootScope",
    "$location",
    "$parse",
  ];

  function LeadsBuyerCtrl($scope, $http, $rootScope) {
    var vm = $scope;
    vm.search = "";
    vm.submitConfirmation = false;
    vm.sortBy = "createdAt";
    vm.sort = "createdAt";
    vm.sortForm = -1;

    vm.showCount = 0;

    vm.leadsBuyer = {};
    vm.leadsBuyer.updatedBy = localStorage.getItem("user");
    vm.savingNotesFor = {};
    vm.userHistoryData = {};
    vm.userHistory = [];
    vm.subStatuses = {
      HotLead: [
        "Visit confirmed",
        "WhatsApp Link shared",
        "Altn not available, search started",
        "Offer shared, under negotiation",
        "Under contract",
      ],
      WarmLead: [
        "Will purchase later",
        "Cx will call back",
        "Added in interested buyer section",
      ],
      ColdLead: ["Will purchase later"],
      DeadLead: [
        "Test Lead",
        "Already purchased from outside",
        "Dropped the plan to purchase",
        "Not contactable",
        "Not interested anymore",
        "Broker/Agency",
        "Commercial project query",
      ],
      First_discussion_pending: [
        "RNR",
        "Switched off",
        "Requested for Call Back",
      ],
    };

    vm.SuccessAlertBox = "";
    vm.ErrorAlertBox = ";";
    vm.ErrorSaveMessage = "";
    vm.SucessSaveMessage = "";
    vm.SuccessAlertBox = document.getElementById("SuccessAlertBox");
    vm.ErrorAlertBox = document.getElementById("ErrorAlertBox");

    vm.statusFilter = "";
    vm.subStatusFilter = "";
    vm.statusFilterToSend = {};

    vm.aggregateStatus = {};
    vm.aggregateSubStatus = {};

    vm.filterByStatus = () => {
      if (vm.statusFilter !== "") {
        if (vm.statusFilterToSend.latestStatus) {
          if (vm.statusFilter !== vm.statusFilterToSend.latestStatus) {
            vm.subStatusFilter = "";
          }
        }
        vm.statusFilterToSend = {};
        if (vm.statusFilter === "blank") {
          vm.statusFilterToSend["$or"] = [
            {
              latestStatus: "",
            },
            {
              latestStatus: null,
            },
          ];
        } else {
          vm.statusFilterToSend.latestStatus = vm.statusFilter;
        }
        if (vm.subStatusFilter !== "") {
          console.log(
            vm.subStatuses[vm.statusFilter],
            vm.subStatusFilter,
            vm.subStatuses[vm.statusFilter].includes(vm.subStatusFilter)
          );
          if (vm.subStatuses[vm.statusFilter].includes(vm.subStatusFilter)) {
            vm.statusFilterToSend.latestSubStatus = vm.subStatusFilter;
          } else {
            vm.subStatusFilter = "";
          }
        }
        vm.getAll(1, vm.sortBy, vm.sortForm, vm.statusFilterToSend);
      } else {
        vm.statusFilterToSend = {};
        vm.getAll(1, vm.sortBy, vm.sortForm);
      }
    };

    /* create error notification */
    vm.createError = function (error) {
      vm.ErrorSaveMessage = error;
      vm.ErrorAlertBox.innerHTML = error;
      // vm.ErrorAlertBox.style.display = "inline";
      $("#ErrorAlertBox").fadeIn();
      setTimeout(function () {
        // vm.ErrorAlertBox.style.display = "none";
        $("#ErrorAlertBox").fadeOut();
      }, 4000);
    };

    /* create success notification */
    vm.createSuccess = function (success) {
      vm.SucessSaveMessage = success;
      vm.SuccessAlertBox.innerHTML = success;
      // vm.SuccessAlertBox.style.display = "inline";
      $("#SuccessAlertBox").fadeIn();
      setTimeout(function () {
        // vm.SuccessAlertBox.style.display = "none";
        $("#SuccessAlertBox").fadeOut();
      }, 4000);
    };

    // pagination starts
    vm.pageIndex = 1;
    vm.totalRecords = 0;
    vm.tableData = [];
    vm.paginationCount;
    vm.currentArrayIndex = 0;

    vm.clearSearchBox = function () {
      if (vm.search.length == 0) {
        vm.getAll(1, vm.sortBy, vm.sortForm, vm.statusFilterToSend);
      }
    };

    vm.createPaginationArray = function () {
      vm.mainArray = [];
      var temp = 0;
      var tempArray = [];
      for (var count = 1; count <= vm.paginationCount; count++) {
        if (tempArray.length >= 5) {
          vm.mainArray.push(tempArray);
          tempArray = [];
        }
        tempArray.push(count);
      }
      vm.mainArray.push(tempArray);
      if (vm.pageIndex == 1) {
        vm.currentArrayIndex = 0;
      }
    };

    vm.previousPaginationArray = function () {
      vm.currentArrayIndex = vm.currentArrayIndex - 1;
      vm.getAll(
        vm.mainArray[vm.currentArrayIndex][0],
        vm.sortBy,
        vm.sortForm,
        vm.statusFilterToSend
      );
    };

    vm.nextPaginationArray = function () {
      vm.currentArrayIndex = vm.currentArrayIndex + 1;
      vm.getAll(
        vm.mainArray[vm.currentArrayIndex][0],
        vm.sortBy,
        vm.sortForm,
        vm.statusFilterToSend
      );
    };

    // pagination ends

    vm.showNotesModal = (user) => {
      $("#submitting-notes").hide();
      $("#submit-notes").fadeIn();
      $("#addNotesModal").modal("show");
      vm.savingNotesFor = user;
      vm.leadsBuyer = {};
      vm.leadsBuyer.updatedBy = localStorage.getItem("user");
      if (user.history[0]) {
        vm.leadsBuyer.status = user.history[0] ? user.history[0].status : "";
        vm.leadsBuyer.subStatus = user.history[0]
          ? user.history[0].subStatus
          : "";
        vm.leadsBuyer.whatsappNumber = user.history[0]
          ? user.history[0].whatsappNumber
          : "";
        vm.phoneCode = user.history[0] ? user.history[0].country.code : "+91";
        vm.phoneCodeName = user.history[0]
          ? user.history[0].country.Name
          : "India";
        vm.phoneCodeSearchText = "";
      } else {
        vm.leadsBuyer.whatsappNumber = user.phone;
      }
      console.log(vm.leadsBuyer);
    };
    vm.saveNotes = async () => {
      $("#submit-notes").hide();
      $("#submitting-notes").fadeIn();

      if (
        vm.leadsBuyer.status &&
        !vm.subStatuses[vm.leadsBuyer.status].includes(vm.leadsBuyer.subStatus)
      ) {
        alert("Please choose a valid sub status");
        $("#submit-notes").fadeIn();
        $("#submitting-notes").hide();
        return;
      }
      let phoneNumber = await $.ajax({
        url: "/api/validatePhoneNumber",
        type: "post",
        data: { number: vm.phoneCode + vm.leadsBuyer.whatsappNumber },
      });
      if (!phoneNumber.valid) {
        vm.createError("Invalid Phone Number");
        $("#submit-notes").fadeIn();
        $("#submitting-notes").hide();
        return;
      } else {
        vm.leadsBuyer.whatsappNumber = phoneNumber.valid;
      }
      let country = { code: vm.phoneCode, name: vm.phoneCodeName };
      $http
        .post("api/loanProject/addNotes", {
          data: { update: { ...vm.leadsBuyer, country }, ...vm.savingNotesFor },
        })
        .then(function (res) {
          console.log("res :", res);
          if (res.data.success) {
            console.log(res.data);
            vm.leadsBuyer = {};
            vm.getAll(
              vm.pageIndex,
              vm.sortBy,
              vm.sortForm,
              vm.statusFilterToSend
            );
            alert("Added");
            $("#addNotesModal").modal("hide");
          } else {
            alert(res.data.message);
            if (res.data.err) {
              console.log(res.data.err);
            }
          }
        });
    };

    vm.showHistoryModal = (user) => {
      $("#showLeadsBuyerHistoryModal").modal("show");
      vm.userHistory = user.history;
      vm.userHistoryData = user;
    };

    // get all list
    vm.getAll = function (currentPageIndex, sortBy, sortForm, filter) {
      // $http.post('/api/buyer/get/leads',
      var user = undefined;
      if (window.localStorage.getItem("user")) {
        user = window.localStorage.getItem("user");
      }
      $http
        .post("/api/loanProject/get", {
          param: {
            search: vm.search,
          },
          sortBy: sortBy,
          sortForm: sortForm,
          pageIndex: currentPageIndex,
          recordLimit: 10,
          user: user,
          filter: filter,
        })
        .then(function (res) {
          console.log("res :", res);
          if (res.data.success) {
            vm.pageIndex = currentPageIndex;
            vm.tableData = [];
            vm.totalRecords = res.data.count;
            vm.paginationCount = !res.data.hasFullAccess
              ? 1
              : Math.ceil(vm.totalRecords / 10);
            vm.showCount = res.data.hasFullAccess
              ? res.data.count
              : res.data.docs.length;
            // vm.paginationCount = Math.ceil(vm.totalRecords / 10);
            vm.paginationArray = new Array(vm.paginationCount);
            let potentialUserList = [];
            res.data.docs.forEach((user) => {
              if (user.history) {
                user.history.sort((a, b) => (a.updated < b.updated ? 1 : -1));
                potentialUserList.push(user);
              } else {
                potentialUserList.push(user);
              }

              if (user.latestStatus) {
                user.latestStatus = vm.humanifyString(user.latestStatus);
              }
            });
            if (res.data.aggObjStatus) {
              vm.aggregateStatus = res.data.aggObjStatus;
            }
            if (res.data.aggObjSubStatus) {
              vm.aggregateSubStatus = res.data.aggObjSubStatus;
            }
            vm.usersList = res.data.docs;
            vm.createPaginationArray();
            console.log("vm.usersList", vm.usersList);
          }
        });
    };
    vm.getAll(1, vm.sortBy, vm.sortForm);

    vm.showAsc = true;
    // sortForm is asc or dsc
    vm.changeSort = function (sortBy, sortForm) {
      vm.showAsc = false;
      vm.sortBy = sortBy;
      vm.sortForm = sortForm;
      vm.getAll(1, vm.sortBy, vm.sortForm, vm.statusFilterToSend);
      if (vm.sortForm === -1) {
        vm.sort = vm.sortBy + "reverse";
      } else {
        vm.sort = vm.sortBy;
      }
    };

    vm.humanifyString = (str) => {
      if (str.includes("_")) {
        while (str.includes("_")) {
          str = str.replace("_", " ");
        }
      } else {
        str = str.split("Lead");
        str = str[0] + " Lead";
      }

      return str;
    };

    // phone-code code

    vm.allCountryArray = [
      ["🇦🇫", "Afghanistan (‫افغانستان‬‎)", "+93"],
      ["🇦🇱", "Albania (Shqipëri)", "+355"],
      ["🇩🇿", "Algeria (‫الجزائر‬‎)", "+213"],
      ["🇦🇸", "American Samoa", "+1684"],
      ["🇦🇩", "Andorra", "+376"],
      ["🇦🇴", "Angola", "+244"],
      ["🇦🇮", "Anguilla", "+1264"],
      ["🇦🇬", "Antigua and Barbuda", "+1268"],
      ["🇦🇷", "Argentina", "+54"],
      ["🇦🇲", "Armenia (Հայաստան)", "+374"],
      ["🇦🇼", "Aruba", "+297"],
      ["🇦🇺", "Australia", "+61"],
      ["🇦🇹", "Austria (Österreich)", "+43"],
      ["🇦🇿", "Azerbaijan (Azərbaycan)", "+994"],
      ["🇧🇸", "Bahamas", "+1242"],
      ["🇧🇭", "Bahrain (‫البحرين‬‎)", "+973"],
      ["🇧🇩", "Bangladesh (বাংলাদেশ)", "+880"],
      ["🇧🇧", "Barbados", "+1246"],
      ["🇧🇾", "Belarus (Беларусь)", "+375"],
      ["🇧🇪", "Belgium (België)", "+32"],
      ["🇧🇿", "Belize", "+501"],
      ["🇧🇯", "Benin (Bénin)", "+229"],
      ["🇧🇲", "Bermuda", "+1441"],
      ["🇧🇹", "Bhutan (འབྲུག)", "+975"],
      ["🇧🇴", "Bolivia", "+591"],
      ["🇧🇦", "Bosnia and Herzegovina (Босна и Херцеговина)", "+387"],
      ["🇧🇼", "Botswana", "+267"],
      ["🇧🇷", "Brazil (Brasil)", "+55"],
      ["🇮🇴", "British Indian Ocean Territory", "+246"],
      ["🇻🇬", "British Virgin Islands", "+1284"],
      ["🇧🇳", "Brunei", "+673"],
      ["🇧🇬", "Bulgaria (България)", "+359"],
      ["🇧🇫", "Burkina Faso", "+226"],
      ["🇧🇮", "Burundi (Uburundi)", "+257"],
      ["🇰🇭", "Cambodia (កម្ពុជា)", "+855"],
      ["🇨🇲", "Cameroon (Cameroun)", "+237"],
      ["🇨🇦", "Canada", "+1"],
      ["🇨🇻", "Cape Verde (Kabu Verdi)", "+238"],
      ["🇰🇾", "Cayman Islands", "+1345"],
      ["🇨🇫", "Central African Republic (République centrafricaine)", "+236"],
      ["🇹🇩", "Chad (Tchad)", "+235"],
      ["🇨🇱", "Chile", "+56"],
      ["🇨🇳", "China (中国)", "+86"],
      ["🇨🇽", "Christmas Island", "+61"],
      ["🇨🇨", "Cocos (Keeling) Islands", "+61"],
      ["🇨🇴", "Colombia", "+57"],
      ["🇰🇲", "Comoros (‫جزر القمر‬‎)", "+269"],
      ["🇨🇩", "Congo (DRC) (Jamhuri ya Kisoemokrasia ya Kongo)", "+243"],
      ["🇨🇬", "Congo (Republic) (Congo-Brazzaville)", "+242"],
      ["🇨🇰", "Cook Islands", "+682"],
      ["🇨🇷", "Costa Rica", "+506"],
      ["🇨🇮", "Côte d’Ivoire", "+225"],
      ["🇭🇷", "Croatia (Hrvatska)", "+385"],
      ["🇨🇺", "Cuba", "+53"],
      ["🇨🇼", "Curaçao", "+599"],
      ["🇨🇾", "Cyprus (Κύπρος)", "+357"],
      ["🇨🇿", "Czech Republic (Česká republika)", "+420"],
      ["🇩🇰", "Denmark (Danmark)", "+45"],
      ["🇩🇯", "Djibouti", "+253"],
      ["🇩🇲", "Dominica", "+1767"],
      ["🇩🇴", "Dominican Republic (República Dominicana)", "+1"],
      ["🇪🇨", "Ecuador", "+593"],
      ["🇪🇬", "Egypt (‫مصر‬‎)", "+20"],
      ["🇸🇻", "El Salvador", "+503"],
      ["🇬🇶", "Equatorial Guinea (Guinea Ecuatorial)", "+240"],
      ["🇪🇷", "Eritrea", "+291"],
      ["🇪🇪", "Estonia (Eesti)", "+372"],
      ["🇪🇹", "Ethiopia", "+251"],
      ["🇫🇰", "Falkland Islands (Islas Malvinas)", "+500"],
      ["🇫🇴", "Faroe Islands (Føroyar)", "+298"],
      ["🇫🇯", "Fiji", "+679"],
      ["🇫🇮", "Finland (Suomi)", "+358"],
      ["🇫🇷", "France", "+33"],
      ["🇬🇫", "French Guiana (Guyane française)", "+594"],
      ["🇵🇫", "French Polynesia (Polynésie française)", "+689"],
      ["🇬🇦", "Gabon", "+241"],
      ["🇬🇲", "Gambia", "+220"],
      ["🇬🇪", "Georgia (საქართველო)", "+995"],
      ["🇩🇪", "Germany (Deutschland)", "+49"],
      ["🇬🇭", "Ghana (Gaana)", "+233"],
      ["🇬🇮", "Gibraltar", "+350"],
      ["🇬🇷", "Greece (Ελλάδα)", "+30"],
      ["🇬🇱", "Greenland (Kalaallit Nunaat)", "+299"],
      ["🇬🇩", "Grenada", "+1473"],
      ["🇬🇵", "Guadeloupe", "+590"],
      ["🇬🇺", "Guam", "+1671"],
      ["🇬🇹", "Guatemala", "+502"],
      ["🇬🇬", "Guernsey", "+44"],
      ["🇬🇳", "Guinea (Guinée)", "+224"],
      ["🇬🇼", "Guinea-Bissau (Guiné Bissau)", "+245"],
      ["🇬🇾", "Guyana", "+592"],
      ["🇭🇹", "Haiti", "+509"],
      ["🇭🇳", "Honduras", "+504"],
      ["🇭🇰", "Hong Kong (香港)", "+852"],
      ["🇭🇺", "Hungary (Magyarország)", "+36"],
      ["🇮🇸", "Iceland (Ísland)", "+354"],
      ["🇮🇳", "India (भारत)", "+91"],
      ["🇮🇩", "Indonesia", "+62"],
      ["🇮🇷", "Iran (‫ایران‬‎)", "+98"],
      ["🇮🇶", "Iraq (‫العراق‬‎)", "+964"],
      ["🇮🇪", "Ireland", "+353"],
      ["🇮🇲", "Isle of Man", "+44"],
      ["🇮🇱", "Israel (‫ישראל‬‎)", "+972"],
      ["🇮🇹", "Italy (Italia)", "+39"],
      ["🇯🇲", "Jamaica", "+1"],
      ["🇯🇵", "Japan (日本)", "+81"],
      ["🇯🇪", "Jersey", "+44"],
      ["🇯🇴", "Jordan (‫الأردن‬‎)", "+962"],
      ["🇰🇿", "Kazakhstan (Казахстан)", "+7"],
      ["🇰🇪", "Kenya", "+254"],
      ["🇰🇮", "Kiribati", "+686"],
      ["🇽🇰", "Kosovo", "+383"],
      ["🇰🇼", "Kuwait (‫الكويت‬‎)", "+965"],
      ["🇰🇬", "Kyrgyzstan (Кыргызстан)", "+996"],
      ["🇱🇦", "Laos (ລາວ)", "+856"],
      ["🇱🇻", "Latvia (Latvija)", "+371"],
      ["🇱🇧", "Lebanon (‫لبنان‬‎)", "+961"],
      ["🇱🇸", "Lesotho", "+266"],
      ["🇱🇷", "Liberia", "+231"],
      ["🇱🇾", "Libya (‫ليبيا‬‎)", "+218"],
      ["🇱🇮", "Liechtenstein", "+423"],
      ["🇱🇹", "Lithuania (Lietuva)", "+370"],
      ["🇱🇺", "Luxembourg", "+352"],
      ["🇲🇴", "Macau (澳門)", "+853"],
      ["🇲🇰", "North Macedonia (FYROM) (Македонија)", "+389"],
      ["🇲🇬", "Madagascar (Madagasikara)", "+261"],
      ["🇲🇼", "Malawi", "+265"],
      ["🇲🇾", "Malaysia", "+60"],
      ["🇲🇻", "Maldives", "+960"],
      ["🇲🇱", "Mali", "+223"],
      ["🇲🇹", "Malta", "+356"],
      ["🇲🇭", "Marshall Islands", "+692"],
      ["🇲🇶", "Martinique", "+596"],
      ["🇲🇷", "Mauritania (‫موريتانيا‬‎)", "+222"],
      ["🇲🇺", "Mauritius (Moris)", "+230"],
      ["🇾🇹", "Mayotte", "+262"],
      ["🇲🇽", "Mexico (México)", "+52"],
      ["🇫🇲", "Micronesia", "+691"],
      ["🇲🇩", "Moldova (Republica Moldova)", "+373"],
      ["🇲🇨", "Monaco", "+377"],
      ["🇲🇳", "Mongolia (Монгол)", "+976"],
      ["🇲🇪", "Montenegro (Crna Gora)", "+382"],
      ["🇲🇸", "Montserrat", "+1664"],
      ["🇲🇦", "Morocco (‫المغرب‬‎)", "+212"],
      ["🇲🇿", "Mozambique (Moçambique)", "+258"],
      ["🇲🇲", "Myanmar (Burma) (မြန်မာ)", "+95"],
      ["🇳🇦", "Namibia (Namibië)", "+264"],
      ["🇳🇷", "Nauru", "+674"],
      ["🇳🇵", "Nepal (नेपाल)", "+977"],
      ["🇳🇱", "Netherlands (Nederland)", "+31"],
      ["🇳🇨", "New Caledonia (Nouvelle-Calédonie)", "+687"],
      ["🇳🇿", "New Zealand", "+64"],
      ["🇳🇮", "Nicaragua", "+505"],
      ["🇳🇪", "Niger (Nijar)", "+227"],
      ["🇳🇬", "Nigeria", "+234"],
      ["🇳🇺", "Niue", "+683"],
      ["🇳🇫", "Norfolk Island", "+672"],
      ["🇰🇵", "North Korea (조선 민주주의 인민 공화국)", "+850"],
      ["🇲🇵", "Northern Mariana Islands", "+1670"],
      ["🇳🇴", "Norway (Norge)", "+47"],
      ["🇴🇲", "Oman (‫عُمان‬‎)", "+968"],
      ["🇵🇰", "Pakistan (‫پاکستان‬‎)", "+92"],
      ["🇵🇼", "Palau", "+680"],
      ["🇵🇸", "Palestine (‫فلسطين‬‎)", "+970"],
      ["🇵🇦", "Panama (Panamá)", "+507"],
      ["🇵🇬", "Papua New Guinea", "+675"],
      ["🇵🇾", "Paraguay", "+595"],
      ["🇵🇪", "Peru (Perú)", "+51"],
      ["🇵🇭", "Philippines", "+63"],
      ["🇵🇱", "Poland (Polska)", "+48"],
      ["🇵🇹", "Portugal", "+351"],
      ["🇵🇷", "Puerto Rico", "+1"],
      ["🇶🇦", "Qatar (‫قطر‬‎)", "+974"],
      ["🇷🇪", "Réunion (La Réunion)", "+262"],
      ["🇷🇴", "Romania (România)", "+40"],
      ["🇷🇺", "Russia (Россия)", "+7"],
      ["🇷🇼", "Rwanda", "+250"],
      ["🇧🇱", "Saint Barthélemy", "+590"],
      ["🇸🇭", "Saint Helena", "+290"],
      ["🇰🇳", "Saint Kitts and Nevis", "+1869"],
      ["🇱🇨", "Saint Lucia", "+1758"],
      ["🇲🇫", "Saint Martin (Saint-Martin (partie française))", "+590"],
      ["🇵🇲", "Saint Pierre and Miquelon (Saint-Pierre-et-Miquelon)", "+508"],
      ["🇻🇨", "Saint Vincent and the Grenadines", "+1784"],
      ["🇼🇸", "Samoa", "+685"],
      ["🇸🇲", "San Marino", "+378"],
      ["🇸🇹", "São Tomé and Príncipe (São Tomé e Príncipe)", "+239"],
      ["🇸🇦", "Saudi Arabia (‫المملكة العربية السعودية‬‎)", "+966"],
      ["🇸🇳", "Senegal (Sénégal)", "+221"],
      ["🇷🇸", "Serbia (Србија)", "+381"],
      ["🇸🇨", "Seychelles", "+248"],
      ["🇸🇱", "Sierra Leone", "+232"],
      ["🇸🇬", "Singapore", "+65"],
      ["🇸🇽", "Sint Maarten", "+1721"],
      ["🇸🇰", "Slovakia (Slovensko)", "+421"],
      ["🇸🇮", "Slovenia (Slovenija)", "+386"],
      ["🇸🇧", "Solomon Islands", "+677"],
      ["🇸🇴", "Somalia (Soomaaliya)", "+252"],
      ["🇿🇦", "South Africa", "+27"],
      ["🇰🇷", "South Korea (대한민국)", "+82"],
      ["🇸🇸", "South Sudan (‫جنوب السودان‬‎)", "+211"],
      ["🇪🇸", "Spain (España)", "+34"],
      ["🇱🇰", "Sri Lanka (ශ්‍රී ලංකාව)", "+94"],
      ["🇸🇩", "Sudan (‫السودان‬‎)", "+249"],
      ["🇸🇷", "Suriname", "+597"],
      ["🇸🇯", "Svalbard and Jan Mayen", "+47"],
      ["🇸🇿", "Swaziland", "+268"],
      ["🇸🇪", "Sweden (Sverige)", "+46"],
      ["🇨🇭", "Switzerland (Schweiz)", "+41"],
      ["🇸🇾", "Syria (‫سوريا‬‎)", "+963"],
      ["🇹🇼", "Taiwan (台灣)", "+886"],
      ["🇹🇯", "Tajikistan", "+992"],
      ["🇹🇿", "Tanzania", "+255"],
      ["🇹🇭", "Thailand (ไทย)", "+66"],
      ["🇹🇱", "Timor-Leste", "+670"],
      ["🇹🇬", "Togo", "+228"],
      ["🇹🇰", "Tokelau", "+690"],
      ["🇹🇴", "Tonga", "+676"],
      ["🇹🇹", "Trinisoad and Tobago", "+1868"],
      ["🇹🇳", "Tunisia (‫تونس‬‎)", "+216"],
      ["🇹🇷", "Turkey (Türkiye)", "+90"],
      ["🇹🇲", "Turkmenistan", "+993"],
      ["🇹🇨", "Turks and Caicos Islands", "+1649"],
      ["🇹🇻", "Tuvalu", "+688"],
      ["🇻🇮", "U.S. Virgin Islands", "+1340"],
      ["🇺🇬", "Uganda", "+256"],
      ["🇺🇦", "Ukraine (Україна)", "+380"],
      ["🇦🇪", "United Arab Emirates (‫الإمارات العربية المتحدة‬‎)", "+971"],
      ["🇬🇧", "United Kingdom", "+44"],
      ["🇺🇸", "United States", "+1"],
      ["🇺🇾", "Uruguay", "+598"],
      ["🇺🇿", "Uzbekistan (Oʻzbekiston)", "+998"],
      ["🇻🇺", "Vanuatu", "+678"],
      ["🇻🇦", "Vatican City (Città del Vaticano)", "+39"],
      ["🇻🇪", "Venezuela", "+58"],
      ["🇻🇳", "Vietnam (Việt Nam)", "+84"],
      ["🇼🇫", "Wallis and Futuna (Wallis-et-Futuna)", "+681"],
      ["🇾🇪", "Yemen (‫اليمن‬‎)", "+967"],
      ["🇿🇲", "Zambia", "+260"],
      ["🇿🇼", "Zimbabwe", "+263"],
      ["🇦🇽", "Åland Islands", "+358"],
    ];

    vm.allCountryCodesObject = vm.allCountryArray.map((x) => {
      return {
        flag: x[0],
        name: x[1],
        code: x[2],
      };
    });

    vm.countryCodeFName = "";
    vm.countryNameFName = "";
    vm.parentContainer = "";
    vm.phoneCodeSearch = "";
    vm.phoneCode = "";
    vm.phoneName = "";
    vm.phoneCodeSearchText = "";

    vm.showPhoneCodeOptions = (c, n, p, se) => {
      console.log(c, n, p, se);
      vm.countryCodeFName = c;
      vm.countryNameFName = n;
      vm.parentContainer = p;
      vm.phoneCodeSearch = se;

      $("#" + vm.countryCodeFName).hide();
      $("#" + vm.phoneCodeSearch).show();
      $("#" + vm.phoneCodeSearch).focus();

      vm.showFilteredPhoneCodeOptions(vm.allCountryCodesObject);

      let s = document.getElementById(vm.phoneCodeSearch);
      s.addEventListener("input", (e) => {
        vm.searchInPhoneCodes(e);
      });
      s.addEventListener("blur", (e) => {
        $("#" + vm.parentContainer).fadeOut();
        $("#" + vm.countryCodeFName).show();
        $("#" + vm.phoneCodeSearch).hide();
      });
      $("#" + vm.parentContainer).slideDown();
    };

    vm.showFilteredPhoneCodeOptions = (obj) => {
      let table = document.querySelector("#" + vm.parentContainer + " table");
      table.innerHTML = "";
      if (table) {
        obj.forEach((x) => {
          let tr = document.createElement("tr");
          tr.innerHTML = `<td class='cf'>${x.flag}</td><td class='cn'>${x.name}</td><td class='px-1 cc'>${x.code}</td>`;
          tr.setAttribute(
            "class",
            "px-3 d-flex flex-row justify-content-start cursor-pointer"
          );
          tr.addEventListener("click", (e) => {
            vm.setCountryCode(x.code, x.name);
          });
          table.appendChild(tr);
        });
      }
    };

    vm.setCountryCode = (code, name) => {
      console.log(code, name);
      console.log(vm.countryCodeFName, vm.countryNameFName);

      vm.phoneCodeSearchText = code;
      vm.phoneCode = code;
      vm.phoneCodeName = name;

      console.log(vm.phoneCode, vm.phoneCodeName, vm.phoneCodeSearchText);

      $("#" + vm.parentContainer).fadeOut();
      $("#" + vm.countryCodeFName).show();
      $("#" + vm.countryCodeFName).val(code);
      $("#" + vm.phoneCodeSearch).hide();
    };

    vm.searchInPhoneCodes = (e) => {
      console.log(e.target.value);
      let res = vm.allCountryCodesObject.filter(
        (x) =>
          x.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
          x.code.toLowerCase().includes(e.target.value.toLowerCase())
      );
      vm.showFilteredPhoneCodeOptions(res);
    };
  }
})();
