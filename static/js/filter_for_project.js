var queryString = document.location.search;
if (queryString.length > 0) {
    filter_state_for_project = parseQueryStringToDictionary(queryString)
}
else {
    filter_state_for_project = {}
}
function parseQueryStringToDictionary(queryString) {
    var dictionary = {};

    if (queryString.indexOf('?') === 0) {
        queryString = queryString.substr(1);
    }

    var parts = queryString.split('&');
    for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        var keyValuePair = p.split('=');

        var key = keyValuePair[0];
        var value = keyValuePair[1];

        value = decodeURIComponent(value);
        value = value.replace(/\+/g, ' ');
        if (value != "q") { value = value.split(",") }

        dictionary[key] = value;
    }

    return dictionary;
}

var check_and_create_filter_after_api_call = function (key, element) {
    if (key == "city" || key == "subcity" || key == "district" || key == "state") {
        var container_idx = ("location" + "-filter-container-list");
    } else {
        var container_idx = (key + "-filter-container-list");
    }
    console.log("container_idx", container_idx)
    let idx = (key + "-" + element.split(" ").join("-"));
    idx = idx.toLowerCase();
    let ele = document.getElementById(container_idx)
    if (ele === undefined || ele === null) { return }
    let check_box_container =  `<li>
        <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input"  id="`+ idx + `" onchange="handleFilters('` + key + `','` + element + `')"  checked="checked" autocomplete="off">
            <label class="custom-control-label" for="`+ idx + `">` + element + `</label>
        </div>
    </li>`

    ele.appendChild(createElementFromHTML(check_box_container));

    // For quick Filters
    let quickEle = document.getElementById("quick-" + container_idx);
    if(quickEle) {
        let quick_check_box_container =  `<li>
            <div class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input"  id="quick-`+ idx + `" onchange="handleFilters('` + key + `','` + element + `')"  checked="checked" autocomplete="off">
                <label class="custom-control-label" for="quick-`+ idx + `">` + element + `</label>
            </div>
        </li>`

        quickEle.appendChild(createElementFromHTML(quick_check_box_container));
    }
}

function set_filter_after_api_call(state) {
    state.forEach(key => {
        if(filter_state[key]) {
            filter_state[key].forEach(element => {
                let idx = (key + "-" + element.split(" ").join("-"))
                idx = idx.toLowerCase();
                ele = document.getElementById(idx)

                let parentEle = document.getElementById("li-" + idx);
                if(parentEle) {
                    parentEle.classList.remove("d-none");
                }

                if (ele) {
                    ele.checked = true;
                }
                else {
                    check_and_create_filter_after_api_call(key, element)
                }

                // For quick Filters
                var quickEle = document.getElementById("quick-" + idx)
                if (quickEle) {
                    quickEle.checked = true;
                }
                let parentElequick = document.getElementById("quick-li-" + idx);
                if(parentElequick) {
                    parentElequick.classList.remove("d-none");
                }
            });
        }
    })
}