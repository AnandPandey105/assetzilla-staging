function fetchArea() {
  if (window.location.pathname == "/properties") {
    $.post(
      "/api/getFilterData/area_property",
      { query: JSON.stringify(filter_state_for_project) },
      function (data) {
        if (data.success) {
          Object.keys(data.data).forEach(function (key) {
            document.getElementById(
              `${key}`
            ).innerHTML = ` (${data.data[key]})`;
          });
        }
        // if (data.length > 1) {
        //     let holder = document.createElement('span')
        //     holder.innerHTML = data;

        //     let popupEle = holder.getElementsByClassName("popup");
        //     epl = popupEle.length
        //     for (let index = 0; index < epl; index++) {
        //         $("#area-filter-container-list").append(popupEle.item(0));
        //     }

        //     let quickEle = holder.getElementsByClassName("quick");
        //     epl = quickEle.length
        //     for (let index = 0; index < epl; index++) {
        //         $("#quick-area-filter-container-list").append(quickEle.item(0));
        //     }
        //     set_filter_after_api_call(["area"])

        // }
      }
    );
  } else {
    $.post(
      "/api/getFilterData/area",
      { query: JSON.stringify(filter_state_for_project) },
      function (data) {
        if (data.success) {
          Object.keys(data.data).forEach(function (key) {
            document.getElementById(
              `${key}`
            ).innerHTML = ` (${data.data[key]})`;
          });
        }
        // if (data.length > 1) {
        //     let holder = document.createElement('span')
        //     holder.innerHTML = data;

        //     let popupEle = holder.getElementsByClassName("popup");
        //     epl = popupEle.length
        //     for (let index = 0; index < epl; index++) {
        //         $("#area-filter-container-list").append(popupEle.item(0));
        //     }

        //     let quickEle = holder.getElementsByClassName("quick");
        //     epl = quickEle.length
        //     for (let index = 0; index < epl; index++) {
        //         $("#quick-area-filter-container-list").append(quickEle.item(0));
        //     }
        //     set_filter_after_api_call(["area"])

        // }
      }
    );
  }
}

function fetchPriceCount() {
  if (window.location.pathname == "/properties") {
    $.post(
      "/api/getFilterData/price_property",
      { query: JSON.stringify(filter_state_for_project) },
      function (data) {
        if (data.success) {
          Object.keys(data.data).forEach(function (key) {
            document.getElementById(
              `${key}`
            ).innerHTML = ` (${data.data[key]})`;
            if (document.getElementById(`quick-${key}`)) {
              document.getElementById(
                `quick-${key}`
              ).innerHTML = ` (${data.data[key]})`;
            }
          });
        }
        // if (data.length > 1) {
        //     let holder = document.createElement('span')
        //     holder.innerHTML = data;

        //     let popupEle = holder.getElementsByClassName("popup");
        //     epl = popupEle.length
        //     for (let index = 0; index < epl; index++) {
        //         $("#price-filter-container-list").append(popupEle.item(0));
        //     }

        //     let quickEle = holder.getElementsByClassName("quick");
        //     epl = quickEle.length
        //     for (let index = 0; index < epl; index++) {
        //         $("#quick-price-filter-container-list").append(quickEle.item(0));
        //     }
        //     set_filter_after_api_call(["price"])

        // }
      }
    );
  } else {
    $.post(
      "/api/getFilterData/price",
      { query: JSON.stringify(filter_state_for_project) },
      function (data) {
        if (data.success) {
          Object.keys(data.data).forEach(function (key) {
            document.getElementById(
              `${key}`
            ).innerHTML = ` (${data.data[key]})`;
            if (document.getElementById(`quick-${key}`)) {
              document.getElementById(
                `quick-${key}`
              ).innerHTML = ` (${data.data[key]})`;
            }
          });
        }
        // if (data.length > 1) {
        //     let holder = document.createElement('span')
        //     holder.innerHTML = data;

        //     let popupEle = holder.getElementsByClassName("popup");
        //     epl = popupEle.length
        //     for (let index = 0; index < epl; index++) {
        //         $("#price-filter-container-list").append(popupEle.item(0));
        //     }

        //     let quickEle = holder.getElementsByClassName("quick");
        //     epl = quickEle.length
        //     for (let index = 0; index < epl; index++) {
        //         $("#quick-price-filter-container-list").append(quickEle.item(0));
        //     }

        //     set_filter_after_api_call(["price"])

        // }
      }
    );
  }
}

function fetchDealTypeCount() {
  if (window.location.pathname == "/properties") {
    $.post(
      "/api/getFilterData/dynamic_deal_type_property",
      { query: JSON.stringify(filter_state_for_project) },
      function (data) {
        // if (data.success) {
        //     Object.keys(data.data).forEach(function (key) {
        //         document.getElementById(`${key}`).innerHTML = ` (${data.data[key]})`
        //     })
        // }
        if (data.length > 1) {
          $("#condition-filter-container-list").append(data);

          set_filter_after_api_call(["condition"]);
        }
      }
    );
  }
}

function fetchFacingCount() {
  if (window.location.pathname == "/properties") {
    $.post(
      "/api/getFilterData//dynamicFacing_property",
      { query: JSON.stringify(filter_state_for_project) },
      function (data) {
        if (data.length > 1) {
          document.getElementById("facing_name").innerHTML = "Property Facing";

          $("#facing-filter-container-list").append(data);

          set_filter_after_api_call(["facing"]);
        }
      }
    );
  } else {
    $.post(
      "/api/getFilterData/dynamicFacing",
      { query: JSON.stringify(filter_state_for_project) },
      function (data) {
        // if (data.success) {
        //     Object.keys(data.data).forEach(function (key) {
        //         document.getElementById(`${key}`).innerHTML = ` (${data.data[key]})`
        //     })
        // }
        if (data.length > 1) {
          document.getElementById("facing_name").innerHTML = "Project Facing";
          // $("#facing_name").innerHTML = "Project Facing";
          $("#facing-filter-container-list").append(data);
          set_filter_after_api_call(["facing"]);
        }
      }
    );
  }
}

function fetchLocationTypeCount() {
  $.post(
    "/api/getFilterData/dynamicLocation_type",
    { query: JSON.stringify(filter_state_for_project) },
    function (data) {
      // if (data.success) {
      //     Object.keys(data.data).forEach(function (key) {
      //         document.getElementById(`${key}`).innerHTML = ` (${data.data[key]})`
      //     })
      // }

      if (data.length > 1) {
        $("#location_type-filter-container-list").append(data);

        set_filter_after_api_call(["location_type"]);
      }
    }
  );
}

function fetchPropertyTypeData() {
  if (window.location.pathname == "/properties") {
    $.post(
      "/api/getFilterData/property_type_property",
      { query: JSON.stringify(filter_state_for_project) },
      function (data) {
        if (data.success) {
          Object.keys(data.data).forEach(function (key) {
            document.getElementById(
              `${key}`
            ).innerHTML = ` (${data.data[key]})`;
            if (document.getElementById(`quick-${key}`)) {
              document.getElementById(
                `quick-${key}`
              ).innerHTML = ` (${data.data[key]})`;
            }
            if (document.getElementById(`mobile-${key}`)) {
              document.getElementById(
                `mobile-${key}`
              ).innerHTML = ` (${data.data[key]})`;
            }
          });
        }
      }
    );
  } else if (window.location.pathname == "/builders") {
    $.post(
      "/api/getFilterData/property_type_builder",
      { query: JSON.stringify(filter_state_for_project) },
      function (data) {
        if (data.success) {
          Object.keys(data.data).forEach(function (key) {
            document.getElementById(
              `${key}`
            ).innerHTML = ` (${data.data[key]})`;
            if (document.getElementById(`quick-${key}`)) {
              document.getElementById(
                `quick-${key}`
              ).innerHTML = ` (${data.data[key]})`;
            }
            if (document.getElementById(`mobile-${key}`)) {
              document.getElementById(
                `mobile-${key}`
              ).innerHTML = ` (${data.data[key]})`;
            }
          });
        }
      }
    );
  } else {
    $.post(
      "/api/getFilterData/property_type",
      { query: JSON.stringify(filter_state_for_project) },
      function (data) {
        if (data.success) {
          Object.keys(data.data).forEach(function (key) {
            document.getElementById(
              `${key}`
            ).innerHTML = ` (${data.data[key]})`;
            if (document.getElementById(`quick-${key}`)) {
              document.getElementById(
                `quick-${key}`
              ).innerHTML = ` (${data.data[key]})`;
            }
            if (document.getElementById(`mobile-${key}`)) {
              document.getElementById(
                `mobile-${key}`
              ).innerHTML = ` (${data.data[key]})`;
            }
          });
        }
      }
    );
  }
}

function fetchLocationData() {
  if (window.location.pathname == "/properties") {
    $.post(
      "/api/getFilterData/locations_property",
      { skip: 0, limit: 1000, query: JSON.stringify(filter_state_for_project) },
      function (data) {
        if (data.length > 1) {
          let holder = document.createElement("span");
          holder.innerHTML = data;

          let popupEle = holder.getElementsByClassName("popup");
          epl = popupEle.length;
          for (let index = 0; index < epl; index++) {
            $("#location-filter-container-list").append(popupEle.item(0));
          }

          let quickEle = holder.getElementsByClassName("quick");
          epl = quickEle.length;
          for (let index = 0; index < epl; index++) {
            $("#quick-location-filter-container-list").append(quickEle.item(0));
          }

          set_filter_after_api_call(["city", "subcity", "district", "state"]);
        } else {
          document.getElementById("location-filter-see-more").style.display =
            "none";
        }
      }
    );
  } else {
    $.post(
      "/api/getFilterData/locations",
      { skip: 0, limit: 1000, query: JSON.stringify(filter_state_for_project) },
      function (data) {
        if (data.length > 1) {
          let holder = document.createElement("span");
          holder.innerHTML = data;

          let popupEle = holder.getElementsByClassName("popup");
          epl = popupEle.length;
          for (let index = 0; index < epl; index++) {
            $("#location-filter-container-list").append(popupEle.item(0));
          }

          let quickEle = holder.getElementsByClassName("quick");
          epl = quickEle.length;
          for (let index = 0; index < epl; index++) {
            $("#quick-location-filter-container-list").append(quickEle.item(0));
          }

          set_filter_after_api_call(["city", "subcity", "district", "state"]);
        } else {
          document.getElementById("location-filter-see-more").style.display =
            "none";
        }
      }
    );
  }
}

function fetchAuthorityData() {
  if (window.location.pathname == "/properties") {
    $.post(
      "/api/getFilterData/authority_property",
      { skip: 0, limit: 1000, query: JSON.stringify(filter_state_for_project) },
      function (data) {
        if (data.length > 1) {
          $("#authority-filter-container-list").append(data);

          set_filter_after_api_call(["authority"]);
        } else {
          document.getElementById("authority-filter-see-more").style.display =
            "none";
        }
      }
    );
  } else {
    $.post(
      "/api/getFilterData/authority",
      { skip: 0, limit: 1000, query: JSON.stringify(filter_state_for_project) },
      function (data) {
        if (data.length > 1) {
          $("#authority-filter-container-list").append(data);

          set_filter_after_api_call(["authority"]);
        } else {
          document.getElementById("authority-filter-see-more").style.display =
            "none";
        }
      }
    );
  }
}

function fetchBuilder() {
  if (window.location.pathname == "/properties") {
    $.post(
      "/api/getFilterData/builders_property",
      { skip: 0, limit: 1000, query: JSON.stringify(filter_state_for_project) },
      function (data) {
        if (data.length > 1) {
          $("#builder-filter-container-list").append(data);
          set_filter_after_api_call(["builder"]);
        } else {
          let selection = document.getElementById("builder-filter-see-more")
          if (selection)
            selection.style.display = "none";
        }
      }
    );
  } else {
    $.post(
      "/api/getFilterData/builders",
      { skip: 0, limit: 1000, query: JSON.stringify(filter_state_for_project) },
      function (data) {
        // console.log("data", data)
        if (data.length > 1) {
          $("#builder-filter-container-list").append(data);
          set_filter_after_api_call(["builder"]);
        } else {
          let selection = document.getElementById("builder-filter-see-more")
          if (selection)
            selection.style.display = "none";
        }
      }
    );
  }
}

function fetchBanks() {
  if (window.location.pathname == "/properties") {
    $.post(
      "/api/getFilterData/bank_property",
      { skip: 0, limit: 1000, query: JSON.stringify(filter_state_for_project) },
      function (data) {
        if (data.length > 1) {
          $("#bank-filter-container-list").append(data);

          set_filter_after_api_call(["bank"]);
        } else {
          // document.getElementById("bank-filter-see-more").style.display =
          //   "none";
          let selection = document.getElementById("bank-filter-see-more")
          if (selection)
            selection.style.display = "none";
        }
      }
    );
  } else {
    $.post(
      "/api/getFilterData/bank",
      { skip: 0, limit: 1000, query: JSON.stringify(filter_state_for_project) },
      function (data) {
        if (data.length > 1) {
          $("#bank-filter-container-list").append(data);

          set_filter_after_api_call(["bank"]);
        } else {
          // document.getElementById("bank-filter-see-more").style.display =
          //   "none";
          let selection = document.getElementById("bank-filter-see-more");
          if (selection)
            selection.style.display = "none";
        }
      }
    );
  }
}

function fetchProjectStatus() {
  if (window.location.pathname == "/properties") {
    $.post(
      "/api/getFilterData/status_property",
      { query: JSON.stringify(filter_state_for_project) },
      function (data) {
        if (data.success) {
          Object.keys(data.data).forEach(function (key) {
            document.getElementById(
              `${key}`
            ).innerHTML = ` (${data.data[key]})`;
            if (document.getElementById(`quick-${key}`)) {
              document.getElementById(
                `quick-${key}`
              ).innerHTML = ` (${data.data[key]})`;
            }
          });
        }
      }
    );
  } else if (window.location.pathname == "/builders") {
    $.post(
      "/api/getFilterData/dynamicstatus_builder",
      { query: JSON.stringify(filter_state_for_project) },
      function (data) {
        if (data.length > 1) {
          if (data.length > 1) {
            let holder = document.createElement("span");
            holder.innerHTML = data;

            let popupEle = holder.getElementsByClassName("popup");
            epl = popupEle.length;
            for (let index = 0; index < epl; index++) {
              $("#status-filter-container-list").append(popupEle.item(0));
            }

            let quickEle = holder.getElementsByClassName("quick");
            epl = quickEle.length;
            for (let index = 0; index < epl; index++) {
              $("#quick-status-filter-container-list").append(quickEle.item(0));
            }
          }
          // $("#status-filter-container-list").append(data);

          set_filter_after_api_call(["status"]);
        }
      }
    );
  } else {
    $.post(
      "/api/getFilterData/dynamicstatus",
      { query: JSON.stringify(filter_state_for_project) },
      function (data) {
        // console.log("data", data);

        if (data.length > 1) {
          let holder = document.createElement("span");
          holder.innerHTML = data;

          let popupEle = holder.getElementsByClassName("popup");
          epl = popupEle.length;
          for (let index = 0; index < epl; index++) {
            $("#status-filter-container-list").append(popupEle.item(0));
          }

          let quickEle = holder.getElementsByClassName("quick");
          epl = quickEle.length;
          for (let index = 0; index < epl; index++) {
            $("#quick-status-filter-container-list").append(quickEle.item(0));
          }
        }
        // $("#status-filter-container-list").append(data);

        set_filter_after_api_call(["status"]);
      }
    );

    // if (data.success) {
    //     Object.keys(data.data).forEach(function (key) {
    //         document.getElementById(`${key}`).innerHTML = ` (${data.data[key]})`;
    //         if (document.getElementById(`quick-${key}`)) {
    //             document.getElementById(`quick-${key}`).innerHTML = ` (${data.data[key]})`;
    //         }
    //     })
    // }
  }
}

function initLocationTypeAhead() {
  let location_typeahead = $("#location-search .typeahead").typeahead(
    {
      hint: false,
      highlight: true,
      minLength: 1,
    },
    {
      name: "location-search",
      display: "name",
      source: function (query, syncResults, asyncResults) {
        if (query.length > 0) {
          $.post("/api/location/typeahead", { data: query }, function (data) {
            asyncResults(data.results);
          });
        }
      },
      templates: {
        suggestion: function (data) {
          result = "<div>" + data.name;
          result +=
            '<p class="entity__type_suggestions">' +
            data.location_type +
            "</p>";
          result += "</div>";
          return result;
        },
      },
    }
  );

  $("#location-search").bind("typeahead:selected", function (obj, datum, name) {
    if (!(datum.location_type in filter_state)) {
      filter_state[datum.location_type] = [];
    }
    if (filter_state[datum.location_type].indexOf(datum.name) == -1) {
      filter_state[datum.location_type].push(datum.name);
    }
    let idx = datum.location_type + "-" + datum.name.split(" ").join("-");
    idx = idx.toLowerCase();
    let ele = document.getElementById(idx);
    if (ele === undefined || ele === null) {
      set_filter_after_api_call(["city", "subcity", "district", "state"]);
    } else {
      ele.checked = true;
      let parentEle = document.getElementById("li-" + idx);
      if (parentEle) {
        parentEle.classList.remove("d-none");
      }
    }

    location_typeahead.typeahead("val", "");
  });
}

function initLocationTypeAheadQuick() {
  let location_typeahead = $("#quick-location-search .typeahead").typeahead(
    {
      hint: false,
      highlight: true,
      minLength: 1,
    },
    {
      name: "location-search",
      display: "name",
      source: function (query, syncResults, asyncResults) {
        if (query.length > 0) {
          $.post("/api/location/typeahead", { data: query }, function (data) {
            asyncResults(data.results);
          });
        }
      },
      templates: {
        suggestion: function (data) {
          result = "<div>" + data.name;
          result +=
            '<p class="entity__type_suggestions">' +
            data.location_type +
            "</p>";
          result += "</div>";
          return result;
        },
      },
    }
  );

  $("#quick-location-search").bind(
    "typeahead:selected",
    function (obj, datum, name) {
      if (!(datum.location_type in filter_state)) {
        filter_state[datum.location_type] = [];
      }
      if (filter_state[datum.location_type].indexOf(datum.name) == -1) {
        filter_state[datum.location_type].push(datum.name);
      }
      let idx = datum.location_type + "-" + datum.name.split(" ").join("-");
      idx = idx.toLowerCase();

      let ele = document.getElementById("quick-" + idx);
      if (ele === undefined || ele === null) {
        set_filter_after_api_call(["city", "subcity", "district", "state"]);
      } else {
        ele.checked = true;
        let parentEle = document.getElementById("quick-li-" + idx);
        if (parentEle) {
          parentEle.classList.remove("d-none");
        }
      }
      location_typeahead.typeahead("val", "");
    }
  );
}

function initBuilderTypeAhead() {
  // BUILDER FILTER
  let builder_typeahead = $("#builder-search .typeahead").typeahead(
    {
      hint: false,
      highlight: true,
      minLength: 1,
    },
    {
      name: "builder-search",
      display: "name",
      source: function (query, syncResults, asyncResults) {
        if (query.length > 0) {
          $.post("/api/builder/typeahead", { data: query }, function (data) {
            asyncResults(data.results);
          });
        }
      },
      templates: {
        suggestion: function (data) {
          result = "<div>" + data.name;
          result += '<p class="entity__type_suggestions"></p>';
          result += "</div>";
          return result;
        },
      },
    }
  );

  $("#builder-search").bind("typeahead:selected", function (obj, datum, name) {
    if (!(datum.doc_type in filter_state)) {
      filter_state[datum.doc_type] = [];
    }
    if (filter_state[datum.doc_type].indexOf(datum.name) == -1) {
      filter_state[datum.doc_type].push(datum.name);
    }
    let idx = datum.doc_type + "-" + datum.name.split(" ").join("-");
    idx = idx.toLowerCase();
    let ele = document.getElementById(idx);
    if (ele === undefined || ele === null) {
      set_filter_after_api_call(["builder"]);
    } else {
      ele.checked = true;

      // On Selection show the count of Project
      let parentEle = document.getElementById("li-" + idx);
      if (parentEle) {
        parentEle.classList.remove("d-none");
      }
    }
    builder_typeahead.typeahead("val", "");
  });
}

function initAuthorityTypeAhead() {
  // Authority FILTER
  let authority_typeahead = $("#authority-search .typeahead").typeahead(
    {
      hint: false,
      highlight: true,
      minLength: 1,
    },
    {
      name: "authority-search",
      display: "name",
      source: function (query, syncResults, asyncResults) {
        if (query.length > 0) {
          $.post("/api/authority/typeahead", { data: query }, function (data) {
            asyncResults(data.results);
          });
        }
      },
      templates: {
        suggestion: function (data) {
          result = "<div>" + data.name;
          result += '<p class="entity__type_suggestions"></p>';
          result += "</div>";
          return result;
        },
      },
    }
  );

  $("#authority-search").bind(
    "typeahead:selected",
    function (obj, datum, name) {
      if (!(datum.doc_type in filter_state)) {
        filter_state[datum.doc_type] = [];
      }
      if (filter_state[datum.doc_type].indexOf(datum.name) == -1) {
        filter_state[datum.doc_type].push(datum.name);
      }
      let idx = datum.doc_type + "-" + datum.name.split(" ").join("-");
      idx = idx.toLowerCase();
      let ele = document.getElementById(idx);
      if (ele === undefined || ele === null) {
        set_filter_after_api_call(["authority"]);
      } else {
        ele.checked = true;
        // On Selection show the count of Project
        let parentEle = document.getElementById("li-" + idx);
        if (parentEle) {
          parentEle.classList.remove("d-none");
        }
      }
      authority_typeahead.typeahead("val", "");
    }
  );
}

function initProjectTypeAhead() {
  let project_typeahead = $("#project-search .typeahead").typeahead(
    {
      hint: false,
      highlight: true,
      minLength: 1,
    },
    {
      name: "project-search",
      display: "name",
      source: function (query, syncResults, asyncResults) {
        if (query.length > 0) {
          $.post("/api/project/typeahead", { data: query }, function (data) {
            asyncResults(data.results);
          });
        }
      },
      templates: {
        suggestion: function (data) {
          result = "<div>" + data.name;
          result += '<p class="entity__type_suggestions"></p>';
          result += "</div>";
          return result;
        },
      },
    }
  );

  $("#project-search").bind("typeahead:selected", function (obj, datum, name) {
    if (!(datum.doc_type in filter_state)) {
      filter_state[datum.doc_type] = [];
    }
    if (filter_state[datum.doc_type].indexOf(datum.name) == -1) {
      filter_state[datum.doc_type].push(datum.name);
    }
    let idx = datum.doc_type + "-" + datum.name.split(" ").join("-");
    idx = idx.toLowerCase();
    let ele = document.getElementById(idx);
    if (ele === undefined || ele === null) {
      set_filter_after_api_call(["project"]);
    } else {
      ele.checked = true;
    }
    project_typeahead.typeahead("val", "");
  });
}

function initBankTypeAhead() {
  let bank_typeahead = $("#bank-search .typeahead").typeahead(
    {
      hint: false,
      highlight: true,
      minLength: 1,
    },
    {
      name: "bank-search",
      display: "name",
      source: function (query, syncResults, asyncResults) {
        if (query.length > 0) {
          $.post("/api/bank/typeahead", { data: query }, function (data) {
            asyncResults(data.results);
          });
        }
      },
      templates: {
        suggestion: function (data) {
          result = "<div>" + data.name;
          result += '<p class="entity__type_suggestions"></p>';
          result += "</div>";
          return result;
        },
      },
    }
  );

  $("#bank-search").bind("typeahead:selected", function (obj, datum, name) {
    if (!(datum.doc_type in filter_state)) {
      filter_state[datum.doc_type] = [];
    }
    if (filter_state[datum.doc_type].indexOf(datum.name) == -1) {
      filter_state[datum.doc_type].push(datum.name);
    }
    let idx = datum.doc_type + "-" + datum.name.split(" ").join("-");
    idx = idx.toLowerCase();
    let ele = document.getElementById(idx);
    if (ele === undefined || ele === null) {
      set_filter_after_api_call(["bank"]);
    } else {
      ele.checked = true;
      // On Selection show the count of Project
      let parentEle = document.getElementById("li-" + idx);
      if (parentEle) {
        parentEle.classList.remove("d-none");
      }
    }
    bank_typeahead.typeahead("val", "");
  });
}

function fetchAuthorityTypeCount() {
  $.post(
    "/api/getFilterData/dynamicAuthority_type",
    { query: JSON.stringify(filter_state_for_project) },
    function (data) {
      // if (data.success) {
      //     Object.keys(data.data).forEach(function (key) {
      //         document.getElementById(`${key}`).innerHTML = ` (${data.data[key]})`
      //     })
      // }
      if (data.length > 1) {
        let holder = document.createElement("span");
        holder.innerHTML = data;

        let popupEle = holder.getElementsByClassName("popup");
        epl = popupEle.length;
        for (let index = 0; index < epl; index++) {
          $("#district-filter-container-list").append(popupEle.item(0));
        }

        let quickEle = holder.getElementsByClassName("quick");
        epl = quickEle.length;
        for (let index = 0; index < epl; index++) {
          $("#quick-district-filter-container-list").append(quickEle.item(0));
        }
        set_filter_after_api_call(["district"]);
      }
    }
  );
}

function fetchBankTypeCount() {
  $.post(
    "/api/getFilterData/dynamicbank_type",
    { query: JSON.stringify(filter_state_for_project) },
    function (data) {
      if (data.length > 1) {
        $("#bank-filter-container-list").append(data);
        set_filter_after_api_call(["type"]);
      }
    }
  );
}

function fetchLocalPresenceCount() {
  $.post(
    "/api/getFilterData/dynamiclocal_presence",
    { query: JSON.stringify(filter_state_for_project) },
    function (data) {
      if (data.length > 1) {
        let holder = document.createElement("span");
        holder.innerHTML = data;

        let popupEle = holder.getElementsByClassName("popup");
        epl = popupEle.length;
        for (let index = 0; index < epl; index++) {
          $("#presence-filter-container-list").append(popupEle.item(0));
        }

        let quickEle = holder.getElementsByClassName("quick");
        epl = quickEle.length;
        for (let index = 0; index < epl; index++) {
          $("#quick-presence-filter-container-list").append(quickEle.item(0));
        }
      }
      set_filter_after_api_call(["presence"]);
    }
  );
}

function fetchProjectCount() {
  $.post(
    "/api/getFilterData/project_count",
    { query: JSON.stringify(filter_state_for_project) },
    function (data) {
      if (data.length > 1) {
        $("#project-filter-container-list").append(data);

        set_filter_after_api_call(["project"]);
      } else {
        let selection = document.getElementById("project-filter-see-more")
        if (selection)
          selection.style.display = "none";
      }
    }
  );
}

async function fetchBhkWithPromise() {
  const fetchBhkPromise = () => {
    return new Promise((resolve, reject) => {
      if (window.location.pathname == "/properties") {
        $.post(
          "/api/getFilterData/bhk_property",
          { query: JSON.stringify(filter_state_for_project) },
          function (data) {
            if (data.success) {
              Object.keys(data.data).forEach(function (key) {
                document.getElementById(
                  `${key}`
                ).innerHTML = ` (${data.data[key]})`;
                if (document.getElementById(`quick-${key}`)) {
                  document.getElementById(
                    `quick-${key}`
                  ).innerHTML = ` (${data.data[key]})`;
                }
              });
              resolve(data);
            } else {
              reject(new Error("Failed to fetch filter data."));
            }
          }
        );
      } else {
        $.post(
          "/api/getFilterData/bhk",
          { query: JSON.stringify(filter_state_for_project) },
          function (data) {
            if (data.success) {
              Object.keys(data.data).forEach(function (key) {
                document.getElementById(
                  `${key}`
                ).innerHTML = ` (${data.data[key]})`;
                if (document.getElementById(`quick-${key}`)) {
                  document.getElementById(
                    `quick-${key}`
                  ).innerHTML = ` (${data.data[key]})`;
                }
              });
              resolve(data);
            } else {
              reject(new Error("Failed to fetch filter data."));
            }
          }
        );
      }
    });
  }
  await fetchBhkPromise();
}

function fetchBhk() {
  if (window.location.pathname == "/properties") {
    $.post(
      "/api/getFilterData/bhk_property",
      { query: JSON.stringify(filter_state_for_project) },
      function (data) {
        if (data.success) {
          Object.keys(data.data).forEach(function (key) {
            document.getElementById(
              `${key}`
            ).innerHTML = ` (${data.data[key]})`;
            if (document.getElementById(`quick-${key}`)) {
              document.getElementById(
                `quick-${key}`
              ).innerHTML = ` (${data.data[key]})`;
            }
          });
        }
        // if (data.length > 1) {
        //     let holder = document.createElement('span')
        //     holder.innerHTML = data;

        //     let popupEle = holder.getElementsByClassName("popup");
        //     epl = popupEle.length
        //     for (let index = 0; index < epl; index++) {
        //         $("#area-filter-container-list").append(popupEle.item(0));
        //     }

        //     let quickEle = holder.getElementsByClassName("quick");
        //     epl = quickEle.length
        //     for (let index = 0; index < epl; index++) {
        //         $("#quick-area-filter-container-list").append(quickEle.item(0));
        //     }
        //     set_filter_after_api_call(["area"])

        // }
      }
    );
  } else {
    $.post(
      "/api/getFilterData/bhk",
      { query: JSON.stringify(filter_state_for_project) },
      function (data) {
        if (data.success) {
          Object.keys(data.data).forEach(function (key) {
            document.getElementById(
              `${key}`
            ).innerHTML = ` (${data.data[key]})`;
            if (document.getElementById(`quick-${key}`)) {
              document.getElementById(
                `quick-${key}`
              ).innerHTML = ` (${data.data[key]})`;
            }
          });
        }
        // if (data.length > 1) {
        //     let holder = document.createElement('span')
        //     holder.innerHTML = data;

        //     let popupEle = holder.getElementsByClassName("popup");
        //     epl = popupEle.length
        //     for (let index = 0; index < epl; index++) {
        //         $("#area-filter-container-list").append(popupEle.item(0));
        //     }

        //     let quickEle = holder.getElementsByClassName("quick");
        //     epl = quickEle.length
        //     for (let index = 0; index < epl; index++) {
        //         $("#quick-area-filter-container-list").append(quickEle.item(0));
        //     }
        //     set_filter_after_api_call(["area"])

        // }
      }
    );
  }
}