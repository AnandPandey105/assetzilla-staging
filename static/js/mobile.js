$('#search_category_dropdown_mob a').on('click', function () {
    $('#search_category_select_mob').html($(this).html());
});

let search_fields_mob = function () {
    category_mapping = {
        "All Categories": "/results",
        "Properties": "/properties",
        "Projects": "/projects",
        "Builders": "/builders",
        "Locations": "/locations",
        "Authorities": "/authorities",
        "Banks": "/banks"
    }
    category = $("#search_category_select_mob").html().trim();
    if (category in category_mapping) { url = category_mapping[category] }
    let data = $('#type-ahead-search_mob .typeahead').val();
    window.location = url + "?q=" + data;

}

$('#type-ahead-search_mob').bind('typeahead:selected', function (obj, datum, name) {

    window.location = datum.url;

});

$('#type-ahead-search_mob .typeahead').typeahead({
    hint: false,
    highlight: true,
    minLength: 0,
},
    {
        name: 'real-estate',
        display: 'name',
        source: function (query, syncResults, asyncResults) {
            if (query.length > 0) {
                $.post('/api/search/v1', { data: query }, function (data) {
                    asyncResults(data.results);
                });
            }
            else {
                syncResults([{ "name": "All Properties", "url": "/properties" },
                { "name": "All Projects", "url": "/projects" },
                { "name": "All Builders", "url": "/builders" },
                { "name": "All Locations", "url": "/locations" },
                { "name": "All Authorities", "url": "/authorities" },
                { "name": "All Banks", "url": "/banks" }])
            }
        },
        templates: {
            suggestion: function (data) {
                result = '<div>' + data.name
                if ('doc_type' in data) {
                    if ("location_type" in data) {
                        result += '<p class="entity__type_suggestions">' + data.location_type + '</p>'
                    }
                    else {

                        result += '<p class="entity__type_suggestions">' + data.doc_type + '</p>'
                    }
                }
                result += '</div>'
                return result
            }
        }


    });



// LOAN FOR PROJECT REQUEST FORM
const $formLoanProject = $('#loan-project-form')

$formLoanProject.on('submit', loanProjectSubmitHandler)

function loanProjectSubmitHandler(e) {
    e.preventDefault();

    var loanProjectData = {};
    loanProjectData.project = document.getElementById('loan-project').value,
    loanProjectData.user = document.getElementById('loan-project-user').value,
    loanProjectData.phone = document.getElementById('loan-project-phone').value,
    loanProjectData.email = document.getElementById('loan-project-email').value,
    loanProjectData.countryCode = document.getElementById('loan-project-code').value;
    loanProjectData.countryName = document.getElementById('loan-project-code-name').value;
    loanProjectData.bank = document.getElementById('loan-project-bank').value
    let sendNewsletter = document.getElementById('newsletter-check-project');
    loanProjectData.newsletter = sendNewsletter.checked;
    console.log('loanProjectData', loanProjectData)

    if (loanProjectData.user == "") {
        customAlert('Please provide your name.');
        return;
    }

    if (loanProjectData.phone.length < 1 && loanProjectData.email.length < 1) {
        customAlert('Either email or Phone is mandatory');
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
        // if (!match) {
        //     customAlert("Invalid Phone Number");
        //     vm.loader = false;
        //     return;
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
                customAlert(data.message);
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

    // customAlert('Submitted');

}

if (window.location.pathname == "/news") {
    $("#nav-news").css({ "color": "#28a745" })
} else {
    $("#nav-news").css({ "color": "#000" })
}

// console.log('mobile.js called')
function unitConverter(areas, currentUnit, idx, changeInto) {
    console.log('unitConverter called')
    var res;
    for (var i = 0; i <= areas.length; i++) {
        val = Number(areas[i].area)
        // Acre
        if (currentUnit == "acre") {
            if (changeInto == "sq ft") {
                res = val;
            } else if (changeInto == "sq ft") {
                res = val * 43560;
            } else if (changeInto == "sq yards") {
                res = val * 4840;
            } else if (changeInto == "sq meter") {
                res = val * 4046.856;
            }
        }
        // Sq feet
        else if (currentUnit == "sq ft") {
            if (changeInto == "sq ft") {
                res = val;;
            } else if (changeInto == "acre") {
                res = val / 43560;
            } else if (changeInto == "sq yards") {
                res = val / 9;
            } else if (changeInto == "sq meter") {
                res = val / 10.764;
            }
        }
        // Sq yards
        else if (currentUnit == "sq yards") {
            if (changeInto == "sq yards") {
                res = val;;
            } else if (changeInto == "acre") {
                res = val / 4840;
            } else if (changeInto == "sq ft") {
                res = val / 9;
            } else if (changeInto == "sq meter") {
                res = val / 1.196;
            }
        }
        // Sq meter
        else if (currentUnit == "sq meter") {
            if (changeInto == "sq meter") {
                res = val;;
            } else if (changeInto == "acre") {
                res = val / 4046.856;
            } else if (changeInto == "sq ft") {
                res = val * 10.764;
            } else if (changeInto == "sq yards") {
                res = val * 81.196;
            }
        }
        document.getElementById('area-' + i).innerHTML = res.toFixed(2);
    }

    // if (val === 0) {
    //     return;
    // }

    // // **FOR ROAD**
    // // Sq meter
    // else if (currentUnit == "feet") {
    //     if (changeInto == "feet") {
    //         res = val;;
    //     } else if (changeInto == "yards") {
    //         res = val / 3; console.log(res, 'feet into yards');
    //     } else if (changeInto == "meter") {
    //         res = val / 3.281; console.log(res, 'feet into meter');
    //     }
    // }
    // // yards
    // else if (currentUnit == "yards") {
    //     if (changeInto == "yards") {
    //         res = val;;
    //     } else if (changeInto == "feet") {
    //         res = val / 3; console.log(res, 'yards into feet');
    //     } else if (changeInto == "meter") {
    //         res = val / 3.281; console.log(res, 'yards into meter');
    //     }
    // }
    // // meter
    // else if (currentUnit == "meter") {
    //     if (changeInto == "meter") {
    //         res = val;;
    //     } else if (changeInto == "feet") {
    //         res = val * 3.281; console.log(res, 'meter into feet');
    //     } else if (changeInto == "yards") {
    //         res = val * 1.094; console.log(res, 'meter into yards');
    //     }
    // }

}

// $("#convert-to").on('change', function () {
//     console.log('\n\nthis.value : ', this.value);
//     var currentUnit = document.getElementById("current-unit");
//     var changeInto = document.getElementById("change-into");
//     unitConverter(1, currentUnit, changeInto);
// });
// unitConverter(1, "sq ft", "sq yards");

