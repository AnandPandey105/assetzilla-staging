const express = require('express');
const router = express.Router();
AlphaId = require('../../classes/alphaId');
Elastic = require('../../classes/elasticsearch');
const { asyncForEach } = require("../utils");
const Builder = require('../../models/builder.model');
const District = require('../../models/district.model');
const builder_fields = ["name", "url", "subcity", "city", "logo", "phone", "email", "address", "total_projects", "local_presence", "project_status_count", "price"]
const bank_fields = ["name", "url", "logo", "description", "type", "total_projects"]
const project_fields = ["name", "url", "subcity", "city", "district", "property_type", "project_status", "banner_image", "lease_rent", "location.location", "id", "price", "builder", "total_floors", "area", "facing"];
const location_fields = ["name", "url", "capital_income", "gdp", "population", "location_type", "banner_image", "total_projects", "area", "price", "project_status_count", "total_properties"]
const authority_fields = ["name", "url", "phone", "email", "address", "district", "total_projects", "city", "state", "district", "url", "logo", "price", "project_status_count"];
const property_fields = ["name", "url", "subcity", "city", "property_type", "bhk_space", "furnished", "banner_image", "location.location", "id", "condition", "images", "price", "builder", "area", "sq_fit_cost"];




router.post("/locations", async (req, res) => {
    try {

        let query = req.body.q || "",
            skip = req.body.skip || 0,
            limit = req.body.limit || 1000;
        req.body.query = JSON.parse(req.body.query);

        if(req.body.query && req.body.query.state){
            delete req.body.query.state;
        }

        if(req.body.query && req.body.query.city){
            delete req.body.query.city;
        }

        if(req.body.query && req.body.query.district){
            delete req.body.query.district;
        }

        if(req.body.query && req.body.query.subcity){
            delete req.body.query.subcity;
        }
        let filters = Filters.location_filters({});
        filters.must.push({ "term": { "is_live": "2" } })

        var sort = Filters.location_sort("projects_desc")
        console.log("skip", skip)
        let allLocations = await Elastic.get_entities(query, "location", limit, location_fields, filters, skip, sort)
        allLocations.results = (Images.banner_img_url_list(allLocations.results));

        allLocations.results = allLocations.results.map((lo) => {
            lo.nameAsURL = lo.name.split(" ").join("-").toLowerCase();

            lo.projectCount = lo.total_projects || 0
            return lo
        })

        await asyncForEach(allLocations.results, async (location) => {
            let locationFilter = await Filters.project_filters(Object.assign({}, req.body.query, {
                [location.location_type]: location.name,
            }));
            locationFilter.must.push({ "term": { "is_live": "2" } });

            let locationFilterCount = await Elastic.get_entities_count_filter("", "project", locationFilter);
            location.projectCount = locationFilterCount
        });

        allLocations.results = allLocations.results.filter((ele) => {
            return ele.projectCount > 0
        });

        allLocations.results.sort((a, b) => {
            return b.projectCount - a.projectCount;
        });

        // res.render('partials/filters/location-filter-card', allLocations);
        res.render('pages/v1/partials/filters/location-filter-card', allLocations);
    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});

router.post("/locations_property", async (req, res) => {
    try {

        let query = req.body.q || "",
            skip = req.body.skip || 0,
            limit = req.body.limit || 1000;
        req.body.query = JSON.parse(req.body.query);
     

        if(req.body.query && req.body.query.state){
            delete req.body.query.state;
        }

        if(req.body.query && req.body.query.city){
            delete req.body.query.city;
        }

        if(req.body.query && req.body.query.district){
            delete req.body.query.district;
        }

        if(req.body.query && req.body.query.subcity){
            delete req.body.query.subcity;
        }

        let filters = Filters.location_filters({});
        filters.must.push({ "term": { "is_live": "2" } })

        var sort = Filters.location_sort("properties_desc")
        console.log("skip", skip)
        let allLocations = await Elastic.get_entities(query, "location", limit, location_fields, filters, skip, sort)
        allLocations.results = (Images.banner_img_url_list(allLocations.results));

        allLocations.results = allLocations.results.map((lo) => {
            lo.nameAsURL = lo.name.split(" ").join("-").toLowerCase();

            lo.projectCount = lo.total_properties || 0
            return lo
        })

        await asyncForEach(allLocations.results, async (location) => {
            let locationFilter = await Filters.property_filters(Object.assign({}, req.body.query, {
                [location.location_type]: location.name,
            }));
            locationFilter.must.push({ "term": { "is_live": "2" } });

            let locationFilterCount = await Elastic.get_entities_count_filter("", "property", locationFilter);
            location.projectCount = locationFilterCount
        });

        allLocations.results = allLocations.results.filter((ele) => {
            return ele.projectCount > 0
        });

        allLocations.results.sort((a, b) => {
            return b.projectCount - a.projectCount;
        });

        // res.render('partials/filters/location-filter-card', allLocations);
        res.render('pages/v1/partials/filters/location-filter-card', allLocations);
    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});
router.post("/builders", async (req, res) => {
    try {

        let query = req.body.q || "",
            skip = req.body.skip || 0,
            limit = req.body.limit || 1000;

        req.body.query = JSON.parse(req.body.query);

        let filters = Filters.builder_filters({});
        filters.must.push({ "term": { "is_live": "2" } })

        var sort = Filters.builder_sort("projects_desc")
        console.log("skip", skip)
        let data = await Elastic.get_entities(query, "builder", limit, builder_fields, filters, skip, sort)
        data.results = (Images.logo_img_url_list(data.results, "Builders"));

        data.results = data.results.map((lo) => {
            lo.nameAsURL = lo.name.split(" ").join("-").toLowerCase();
            lo.total_projects = lo.total_projects || 0
            return lo
        });

        await asyncForEach(data.results, async (ele) => {
            let eleFilter = await Filters.project_filters(Object.assign({}, req.body.query, {
                builder: ele.name,
            }));
            eleFilter.must.push({ "term": { "is_live": "2" } });

            let eleFilterCount = await Elastic.get_entities_count_filter("", "project", eleFilter);
            ele.projectCount = eleFilterCount
        });

        data.results = data.results.filter((ele) => {
            return ele.projectCount > 0
        });

        data.results.sort((a, b) => {
            return b.projectCount - a.projectCount;
        });

        // res.render('partials/filters/builder-filter-card', data);
        res.render('pages/v1/partials/filters/builder-filter-card', data);
    } catch (error) {
        console.log("error", error)
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});

router.post("/builders_property", async (req, res) => {
    try {

        let query = req.body.q || "",
            skip = req.body.skip || 0,
            limit = req.body.limit || 1000;

        req.body.query = JSON.parse(req.body.query);

        let filters = Filters.builder_filters({});
        filters.must.push({ "term": { "is_live": "2" } })

        var sort = Filters.builder_sort("propertyreverse")
        console.log("skip", skip)
        let data = await Elastic.get_entities(query, "builder", limit, builder_fields, filters, skip, sort)
        data.results = (Images.logo_img_url_list(data.results, "Builders"));

        data.results = data.results.map((lo) => {
            lo.nameAsURL = lo.name.split(" ").join("-").toLowerCase();
            lo.total_projects = lo.total_projects || 0
            return lo
        });

        await asyncForEach(data.results, async (ele) => {
            let eleFilter = await Filters.property_filters(Object.assign({}, req.body.query, {
                builder: ele.name,
            }));
            eleFilter.must.push({ "term": { "is_live": "2" } });

            let eleFilterCount = await Elastic.get_entities_count_filter("", "property", eleFilter);
            ele.projectCount = eleFilterCount
        });

        data.results = data.results.filter((ele) => {
            return ele.projectCount > 0
        });

        data.results.sort((a, b) => {
            return b.projectCount - a.projectCount;
        });

        // res.render('partials/filters/builder-filter-card', data);
        res.render('pages/v1/partials/filters/builder-filter-card', data);
    } catch (error) {
        console.log("error", error)
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});

router.post("/authority", async (req, res) => {
    try {

        let query = req.body.q || "",
            skip = req.body.skip || 0,
            limit = req.body.limit || 1000;

        req.body.query = JSON.parse(req.body.query);

        let filters = Filters.authority_filters({});
        filters.must.push({ "term": { "is_live": "2" } })

        var sort = Filters.authority_sort("total_projectsreverse")
        console.log("skip", skip)
        let data = await Elastic.get_entities(query, "authority", limit, authority_fields, filters, skip, sort)
        data.results = (Images.logo_img_url_list(data.results, "Authorities"));

        data.results = data.results.map((lo) => {
            lo.nameAsURL = lo.name.split(" ").join("-").toLowerCase();
            lo.total_projects = lo.total_projects || 0
            return lo
        });

        await asyncForEach(data.results, async (ele) => {
            let eleFilter = await Filters.project_filters(Object.assign({}, req.body.query, {
                authority: ele.name,
            }));
            eleFilter.must.push({ "term": { "is_live": "2" } });

            let eleFilterCount = await Elastic.get_entities_count_filter("", "project", eleFilter);
            ele.projectCount = eleFilterCount
        });

        data.results = data.results.filter((ele) => {
            return ele.projectCount > 0
        });

        data.results.sort((a, b) => {
            return b.projectCount - a.projectCount;
        });


        // res.render('partials/filters/authorities-filter-card', data);
        res.render('pages/v1/partials/filters/authorities-filter-card', data);
    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});

router.post("/authority_property", async (req, res) => {
    try {

        let query = req.body.q || "",
            skip = req.body.skip || 0,
            limit = req.body.limit || 1000;

        req.body.query = JSON.parse(req.body.query);

        let filters = Filters.authority_filters({});
        filters.must.push({ "term": { "is_live": "2" } })

        var sort = Filters.authority_sort("total_propertyreverse")
        console.log("skip", skip)
        let data = await Elastic.get_entities(query, "authority", limit, authority_fields, filters, skip, sort)
        data.results = (Images.logo_img_url_list(data.results, "Authorities"));

        data.results = data.results.map((lo) => {
            lo.nameAsURL = lo.name.split(" ").join("-").toLowerCase();
            lo.total_projects = lo.total_properties || 0
            return lo
        });

        await asyncForEach(data.results, async (ele) => {
            let eleFilter = await Filters.property_filters(Object.assign({}, req.body.query, {
                authority: ele.name,
            }));
            eleFilter.must.push({ "term": { "is_live": "2" } });

            let eleFilterCount = await Elastic.get_entities_count_filter("", "property", eleFilter);
            ele.projectCount = eleFilterCount
        });

        data.results = data.results.filter((ele) => {
            return ele.projectCount > 0
        });

        data.results.sort((a, b) => {
            return b.projectCount - a.projectCount;
        });


        // res.render('partials/filters/authorities-filter-card', data);
        res.render('pages/v1/partials/filters/authorities-filter-card', data);
    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});


router.post("/bank", async (req, res) => {
    try {

        let query = req.body.q || "",
            skip = req.body.skip || 0,
            limit = req.body.limit || 1000;

        req.body.query = JSON.parse(req.body.query);

        let filters = Filters.bank_filters({});
        filters.must.push({ "term": { "is_live": "2" } })

        var sort = Filters.bank_sort("projectsreverse")
        let data = await Elastic.get_entities(query, "bank", limit, bank_fields, filters, skip, sort)
        data.results = (Images.logo_img_url_list(data.results, "Authorities"));

        data.results = data.results.map((lo) => {
            lo.nameAsURL = lo.name.split(" ").join("-").toLowerCase();
            lo.total_projects = lo.total_projects || 0
            return lo
        });

        await asyncForEach(data.results, async (ele) => {
            let eleFilter = await Filters.project_filters(Object.assign({}, req.body.query, {
                bank: ele.name,
            }));
            eleFilter.must.push({ "term": { "is_live": "2" } });

            let eleFilterCount = await Elastic.get_entities_count_filter("", "project", eleFilter);
            ele.projectCount = eleFilterCount
        });

        data.results = data.results.filter((ele) => {
            return ele.projectCount > 0
        });

        data.results.sort((a, b) => {
            return b.projectCount - a.projectCount;
        });

        // res.render('partials/filters/bank-filter-card', data);
        res.render('pages/v1/partials/filters/loan-approved-by-card', data);
    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});

router.post("/bank_property", async (req, res) => {
    try {

        let query = req.body.q || "",
            skip = req.body.skip || 0,
            limit = req.body.limit || 1000;

        req.body.query = JSON.parse(req.body.query);

        let filters = Filters.bank_filters({});
        filters.must.push({ "term": { "is_live": "2" } })

        var sort = Filters.bank_sort("propertyreverse")
        let data = await Elastic.get_entities(query, "bank", limit, bank_fields, filters, skip, sort)
        data.results = (Images.logo_img_url_list(data.results, "Authorities"));

        data.results = data.results.map((lo) => {
            lo.nameAsURL = lo.name.split(" ").join("-").toLowerCase();
            lo.total_projects = lo.total_projects || 0
            return lo
        });

        await asyncForEach(data.results, async (ele) => {
            let eleFilter = await Filters.property_filters(Object.assign({}, req.body.query, {
                bank: ele.name,
            }));
            eleFilter.must.push({ "term": { "is_live": "2" } });

            let eleFilterCount = await Elastic.get_entities_count_filter("", "property", eleFilter);
            ele.projectCount = eleFilterCount
        });

        data.results = data.results.filter((ele) => {
            return ele.projectCount > 0
        });

        data.results.sort((a, b) => {
            return b.projectCount - a.projectCount;
        });

        // res.render('partials/filters/bank-filter-card', data);
        res.render('pages/v1/partials/filters/loan-approved-by-card', data);
    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});

router.post("/property_type", async (req, res) => {
    try {
        req.body.query = JSON.parse(req.body.query)

        let filters = await Filters.project_filters(Object.assign({}, req.body.query, {
            type: "Apartments",
            view: "partial"
        }));

        filters.must.push({ "term": { "is_live": "2" } });

        let appartmentCount = await Elastic.get_entities_count_filter("", "project", filters);


        //Residential Plots
        let ResidentialPlots = await Filters.project_filters(Object.assign({}, req.body.query, {
            type: "Residential Plots",
            view: "partial"
        }));

        ResidentialPlots.must.push({ "term": { "is_live": "2" } });

        let residentialPlotsCount = await Elastic.get_entities_count_filter("", "project", ResidentialPlots);


        //Villas
        let Villas = await Filters.project_filters(Object.assign({}, req.body.query, {
            type: "Villas",
            view: "partial"
        }));

        Villas.must.push({ "term": { "is_live": "2" } });

        let villasCount = await Elastic.get_entities_count_filter("", "project", Villas);

        //Commercial Office
        let CommercialOffice = await Filters.project_filters(Object.assign({}, req.body.query, {
            type: "Commercial Office",
            view: "partial"
        }));

        CommercialOffice.must.push({ "term": { "is_live": "2" } });

        let commercialOfficeCount = await Elastic.get_entities_count_filter("", "project", CommercialOffice);

        //Retail Shop
        let RetailShop = await Filters.project_filters(Object.assign({}, req.body.query, {
            type: "Retail Shop",
            view: "partial"
        }));

        RetailShop.must.push({ "term": { "is_live": "2" } });

        let retailShopCount = await Elastic.get_entities_count_filter("", "project", RetailShop);

        //Floors
        let Floors = await Filters.project_filters(Object.assign({}, req.body.query, {
            type: "Floors",
            view: "partial"
        }));

        Floors.must.push({ "term": { "is_live": "2" } });

        let floorsCount = await Elastic.get_entities_count_filter("", "project", Floors);

        //Commercial Land
        let CommercialLand = await Filters.project_filters(Object.assign({}, req.body.query, {
            type: "Commercial Land",
            view: "partial"
        }));

        CommercialLand.must.push({ "term": { "is_live": "2" } });

        let commercialLandCount = await Elastic.get_entities_count_filter("", "project", CommercialLand);


        //Serviced Apartments
        let ServicedApartments = await Filters.project_filters(Object.assign({}, req.body.query, {
            type: "Serviced Apartments",
            view: "partial"
        }));

        ServicedApartments.must.push({ "term": { "is_live": "2" } });

        let servicedApartmentsCount = await Elastic.get_entities_count_filter("", "project", ServicedApartments);

        let IndustrialLand = await Filters.project_filters(Object.assign({}, req.body.query, {
            type: "Industrial Land",
            view: "partial"
        }));

        IndustrialLand.must.push({ "term": { "is_live": "2" } });

        let industrialLandCount = await Elastic.get_entities_count_filter("", "project", IndustrialLand);


        let penthouse = await Filters.project_filters(Object.assign({}, req.body.query, {
            type: "Penthouse",
            view: "partial"
        }));

        penthouse.must.push({ "term": { "is_live": "2" } });

        let penthouseCount = await Elastic.get_entities_count_filter("", "project", penthouse);

        let Duplex = await Filters.project_filters(Object.assign({}, req.body.query, {
            type: "Duplex",
            view: "partial"
        }));

        Duplex.must.push({ "term": { "is_live": "2" } });

        let duplexCount = await Elastic.get_entities_count_filter("", "project", Duplex);

        let Farmhouse = await Filters.project_filters(Object.assign({}, req.body.query, {
            type: "Farm house",
            view: "partial"
        }));

        Farmhouse.must.push({ "term": { "is_live": "2" } });

        let farmhouseCount = await Elastic.get_entities_count_filter("", "project", Farmhouse);

        let allResidentialCount = appartmentCount + residentialPlotsCount + villasCount + floorsCount + penthouseCount + duplexCount;
        let allCommercialCount = commercialOfficeCount + retailShopCount + commercialLandCount + servicedApartmentsCount;
        let othersCount = industrialLandCount + farmhouseCount;

        res.status(200).json({
            success: true,
            data: {
                appartmentCount: appartmentCount,
                residentialPlotsCount,
                villasCount,
                commercialOfficeCount,
                retailShopCount,
                floorsCount,
                commercialLandCount,
                servicedApartmentsCount,
                industrialLandCount,
                penthouseCount,
                duplexCount,
                farmhouseCount,
                allResidentialCount,
                allCommercialCount,
                othersCount
            }
        });

    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});

router.post("/property_type_property", async (req, res) => {
    try {
        console.log("allResidentialCount")
        req.body.query = JSON.parse(req.body.query)

        let filters = await Filters.property_filters(Object.assign({}, req.body.query, {
            type: "Apartments",
            view: "partial"
        }));

        filters.must.push({ "term": { "is_live": "2" } });

        let appartmentCount = await Elastic.get_entities_count_filter("", "property", filters);



        //Residential Plots
        let ResidentialPlots = await Filters.property_filters(Object.assign({}, req.body.query, {
            type: "Residential Plots",
            view: "partial"
        }));

        ResidentialPlots.must.push({ "term": { "is_live": "2" } });

        let residentialPlotsCount = await Elastic.get_entities_count_filter("", "property", ResidentialPlots);


        //Villas
        let Villas = await Filters.property_filters(Object.assign({}, req.body.query, {
            type: "Villas",
            view: "partial"
        }));

        Villas.must.push({ "term": { "is_live": "2" } });

        let villasCount = await Elastic.get_entities_count_filter("", "property", Villas);

        //Commercial Office
        let CommercialOffice = await Filters.property_filters(Object.assign({}, req.body.query, {
            type: "Commercial Office",
            view: "partial"
        }));

        CommercialOffice.must.push({ "term": { "is_live": "2" } });

        let commercialOfficeCount = await Elastic.get_entities_count_filter("", "property", CommercialOffice);

        //Retail Shop
        let RetailShop = await Filters.property_filters(Object.assign({}, req.body.query, {
            type: "Retail Shop",
            view: "partial"
        }));

        RetailShop.must.push({ "term": { "is_live": "2" } });

        let retailShopCount = await Elastic.get_entities_count_filter("", "property", RetailShop);

        //Floors
        let Floors = await Filters.property_filters(Object.assign({}, req.body.query, {
            type: "Floors",
            view: "partial"
        }));

        Floors.must.push({ "term": { "is_live": "2" } });

        let floorsCount = await Elastic.get_entities_count_filter("", "property", Floors);

        //Commercial Land
        let CommercialLand = await Filters.property_filters(Object.assign({}, req.body.query, {
            type: "Commercial Land",
            view: "partial"
        }));

        CommercialLand.must.push({ "term": { "is_live": "2" } });

        let commercialLandCount = await Elastic.get_entities_count_filter("", "property", CommercialLand);


        //Serviced Apartments
        let ServicedApartments = await Filters.property_filters(Object.assign({}, req.body.query, {
            type: "Serviced Apartments",
            view: "partial"
        }));

        ServicedApartments.must.push({ "term": { "is_live": "2" } });

        let servicedApartmentsCount = await Elastic.get_entities_count_filter("", "property", ServicedApartments);

        let IndustrialLand = await Filters.property_filters(Object.assign({}, req.body.query, {
            type: "Industrial Land",
            view: "partial"
        }));

        IndustrialLand.must.push({ "term": { "is_live": "2" } });

        let industrialLandCount = await Elastic.get_entities_count_filter("", "property", IndustrialLand);


        let penthouse = await Filters.property_filters(Object.assign({}, req.body.query, {
            type: "Penthouse",
            view: "partial"
        }));

        penthouse.must.push({ "term": { "is_live": "2" } });

        let penthouseCount = await Elastic.get_entities_count_filter("", "property", penthouse);

        let Duplex = await Filters.property_filters(Object.assign({}, req.body.query, {
            type: "Duplex",
            view: "partial"
        }));

        Duplex.must.push({ "term": { "is_live": "2" } });

        let duplexCount = await Elastic.get_entities_count_filter("", "property", Duplex);

        let Farmhouse = await Filters.property_filters(Object.assign({}, req.body.query, {
            type: "Farm house",
            view: "partial"
        }));

        Farmhouse.must.push({ "term": { "is_live": "2" } });

        let farmhouseCount = await Elastic.get_entities_count_filter("", "property", Farmhouse);

        let allResidentialCount = appartmentCount + residentialPlotsCount + villasCount + floorsCount + penthouseCount + duplexCount;

        let allCommercialCount = commercialOfficeCount + retailShopCount + commercialLandCount + servicedApartmentsCount;
        let othersCount = industrialLandCount + farmhouseCount;


        res.status(200).json({
            success: true,
            data: {
                appartmentCount: appartmentCount,
                residentialPlotsCount,
                villasCount,
                commercialOfficeCount,
                retailShopCount,
                floorsCount,
                commercialLandCount,
                servicedApartmentsCount,
                industrialLandCount,
                penthouseCount,
                duplexCount,
                farmhouseCount,
                allResidentialCount,
                allCommercialCount,
                othersCount
            }
        });

    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});

router.post("/property_type_builder", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query)
        console.log("req.body.query", req.body.query)

        let filters = Filters.builder_filters(Object.assign({}, req.body.query, {
            type: "Apartments",
            view: "partial"
        }));

        filters.must.push({ "term": { "is_live": "2" } });

        let appartmentCount = await Elastic.get_entities_count_filter("", "builder", filters);


        //Residential Plots
        let ResidentialPlots = Filters.builder_filters(Object.assign({}, req.body.query, {
            type: "Residential Plots",
            view: "partial"
        }));

        ResidentialPlots.must.push({ "term": { "is_live": "2" } });

        let residentialPlotsCount = await Elastic.get_entities_count_filter("", "builder", ResidentialPlots);


        //Villas
        let Villas = Filters.builder_filters(Object.assign({}, req.body.query, {
            type: "Villas",
            view: "partial"
        }));

        Villas.must.push({ "term": { "is_live": "2" } });

        let villasCount = await Elastic.get_entities_count_filter("", "builder", Villas);

        //Commercial Office
        let CommercialOffice = Filters.builder_filters(Object.assign({}, req.body.query, {
            type: "Commercial Office",
            view: "partial"
        }));

        CommercialOffice.must.push({ "term": { "is_live": "2" } });

        let commercialOfficeCount = await Elastic.get_entities_count_filter("", "builder", CommercialOffice);

        //Retail Shop
        let RetailShop = Filters.builder_filters(Object.assign({}, req.body.query, {
            type: "Retail Shop",
            view: "partial"
        }));

        RetailShop.must.push({ "term": { "is_live": "2" } });

        let retailShopCount = await Elastic.get_entities_count_filter("", "builder", RetailShop);

        //Floors
        let Floors = Filters.builder_filters(Object.assign({}, req.body.query, {
            type: "Floors",
            view: "partial"
        }));

        Floors.must.push({ "term": { "is_live": "2" } });

        let floorsCount = await Elastic.get_entities_count_filter("", "builder", Floors);

        //Commercial Land
        let CommercialLand = Filters.builder_filters(Object.assign({}, req.body.query, {
            type: "Commercial Land",
            view: "partial"
        }));

        CommercialLand.must.push({ "term": { "is_live": "2" } });

        let commercialLandCount = await Elastic.get_entities_count_filter("", "builder", CommercialLand);


        //Serviced Apartments
        let ServicedApartments = Filters.builder_filters(Object.assign({}, req.body.query, {
            type: "Serviced Apartments",
            view: "partial"
        }));

        ServicedApartments.must.push({ "term": { "is_live": "2" } });

        let servicedApartmentsCount = await Elastic.get_entities_count_filter("", "builder", ServicedApartments);

        let IndustrialLand = Filters.builder_filters(Object.assign({}, req.body.query, {
            type: "Industrial Land",
            view: "partial"
        }));

        IndustrialLand.must.push({ "term": { "is_live": "2" } });

        let industrialLandCount = await Elastic.get_entities_count_filter("", "builder", IndustrialLand);


        let penthouse = Filters.builder_filters(Object.assign({}, req.body.query, {
            type: "Penthouse",
            view: "partial"
        }));

        penthouse.must.push({ "term": { "is_live": "2" } });

        let penthouseCount = await Elastic.get_entities_count_filter("", "builder", penthouse);

        let Duplex = Filters.builder_filters(Object.assign({}, req.body.query, {
            type: "Duplex",
            view: "partial"
        }));

        Duplex.must.push({ "term": { "is_live": "2" } });

        let duplexCount = await Elastic.get_entities_count_filter("", "builder", Duplex);

        let Farmhouse = Filters.builder_filters(Object.assign({}, req.body.query, {
            type: "Farm house",
            view: "partial"
        }));

        Farmhouse.must.push({ "term": { "is_live": "2" } });

        let farmhouseCount = await Elastic.get_entities_count_filter("", "builder", Farmhouse);

        let allResidential = Filters.builder_filters(Object.assign({}, {
            view: ['partial'],
            type:
                ['Duplex',
                    'Penthouse',
                    'Residential Plots',
                    'Apartments', 'Floors', 'Villas']
        }));
        allResidential.must.push({ "term": { "is_live": "2" } });

        let allResidentialCount = await Elastic.get_entities_count_filter("", "builder", allResidential);

        let allCommercial = Filters.builder_filters(Object.assign({}, {
            view: ['partial'],
            type:
                ['Commercial Office',
                    'Retail Shop',
                    'Commercial Land',
                    'Serviced Apartments']
        }));
        allCommercial.must.push({ "term": { "is_live": "2" } });

        let allCommercialCount = await Elastic.get_entities_count_filter("", "builder", allCommercial);

        let others = Filters.builder_filters(Object.assign({}, {
            view: ['partial'],
            type:
                ['Farm house', 'Industrial Land']
        }));

        others.must.push({ "term": { "is_live": "2" } });
        let othersCount = await Elastic.get_entities_count_filter("", "builder", others);


        res.status(200).json({
            success: true,
            data: {
                appartmentCount: appartmentCount,
                residentialPlotsCount,
                villasCount,
                commercialOfficeCount,
                retailShopCount,
                floorsCount,
                commercialLandCount,
                servicedApartmentsCount,
                industrialLandCount,
                penthouseCount,
                duplexCount,
                farmhouseCount,
                allResidentialCount,
                allCommercialCount,
                othersCount
            }
        });

    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});


router.post("/status", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query)

        let filters = await Filters.project_filters(Object.assign({}, req.body.query, {
            status: "Under Construction",
            view: "partial"
        }));
        filters.must.push({ "term": { "is_live": "2" } });

        let underConstructionCount = await Elastic.get_entities_count_filter("", "project", filters);

        let ReadyToMove = Filters.project_filters(Object.assign({}, req.body.query, {
            status: "Ready To Move",
            view: "partial"
        }));
        ReadyToMove.must.push({ "term": { "is_live": "2" } });

        let readyToMoveCount = await Elastic.get_entities_count_filter("", "project", ReadyToMove);


        let PreLaunch = await Filters.project_filters(Object.assign({}, req.body.query, {
            status: "Pre-launch",
            view: "partial"
        }));
        PreLaunch.must.push({ "term": { "is_live": "2" } });

        let preLaunchCount = await Elastic.get_entities_count_filter("", "project", PreLaunch);



        res.status(200).json({
            success: true,
            data: {
                underConstructionCount,
                readyToMoveCount,
                preLaunchCount
            }
        });

    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});


router.post("/dynamicstatus", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query)


        let status = [{ status: "Under Construction", view: "partial" }, { status: "Ready To Move", view: "partial" }, { status: "Pre-launch", view: "partial" }]
        await asyncForEach(status, async (stat) => {
            let filters = await Filters.project_filters(Object.assign({}, req.body.query, stat));
            filters.must.push({ "term": { "is_live": "2" } });
            stat.count = await Elastic.get_entities_count_filter("", "project", filters);
            stat.nameAsURL = "status-" + stat.status.split(" ").join("-").toLowerCase();
        });







        status.sort((a, b) => {
            return b.count - a.count;
        });


        res.render('pages/v1/partials/filters/status-filter-card', { status });
        // res.status(200).json({
        //     success: true,
        //     data: {
        //         status
        //     }
        // });


    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});


router.post("/dynamicstatus_builder", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query)


        let status = [{ status: "Under Construction", view: "partial" }, { status: "Ready To Move", view: "partial" }, { status: "Pre-launch", view: "partial" }]
        await asyncForEach(status, async (stat) => {
            let filters = Filters.builder_filters(Object.assign({}, req.body.query, stat));
            filters.must.push({ "term": { "is_live": "2" } });
            stat.count = await Elastic.get_entities_count_filter("", "builder", filters);
            stat.nameAsURL = "status-" + stat.status.split(" ").join("-").toLowerCase();
        });







        status.sort((a, b) => {
            return b.count - a.count;
        });


        res.render('pages/v1/partials/filters/status-filter-card', { status });
        // res.status(200).json({
        //     success: true,
        //     data: {
        //         status
        //     }
        // });


    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});
router.post("/status_property", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query)

        let filters = await Filters.property_filters(Object.assign({}, req.body.query, {
            status: "Under Construction",
            view: "partial"
        }));
        filters.must.push({ "term": { "is_live": "2" } });

        let underConstructionCount = await Elastic.get_entities_count_filter("", "property", filters);

        let ReadyToMove = await Filters.property_filters(Object.assign({}, req.body.query, {
            status: "Ready To Move",
            view: "partial"
        }));
        ReadyToMove.must.push({ "term": { "is_live": "2" } });

        let readyToMoveCount = await Elastic.get_entities_count_filter("", "property", ReadyToMove);


        let PreLaunch = await Filters.property_filters(Object.assign({}, req.body.query, {
            status: "Pre-launch",
            view: "partial"
        }));
        PreLaunch.must.push({ "term": { "is_live": "2" } });

        let preLaunchCount = await Elastic.get_entities_count_filter("", "property", PreLaunch);


        res.status(200).json({
            success: true,
            data: {
                underConstructionCount,
                readyToMoveCount,
                preLaunchCount
            }
        });

    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});

router.post("/status_builder", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query)

        let filters = Filters.builder_filters(Object.assign({}, req.body.query, {
            status: "Under Construction",
            view: "partial"
        }));
        filters.must.push({ "term": { "is_live": "2" } });

        let underConstructionCount = await Elastic.get_entities_count_filter("", "builder", filters);

        let ReadyToMove = Filters.builder_filters(Object.assign({}, req.body.query, {
            status: "Ready To Move",
            view: "partial"
        }));
        ReadyToMove.must.push({ "term": { "is_live": "2" } });

        let readyToMoveCount = await Elastic.get_entities_count_filter("", "builder", ReadyToMove);


        let PreLaunch = Filters.builder_filters(Object.assign({}, req.body.query, {
            status: "Pre-launch",
            view: "partial"
        }));
        PreLaunch.must.push({ "term": { "is_live": "2" } });

        let preLaunchCount = await Elastic.get_entities_count_filter("", "builder", PreLaunch);


        res.status(200).json({
            success: true,
            data: {
                underConstructionCount,
                readyToMoveCount,
                preLaunchCount
            }
        });

    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});

router.post("/facing", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query)
        let filters = await Filters.project_filters(Object.assign({}, req.body.query, {
            facing: "East",
            view: "partial"
        }));
        filters.must.push({ "term": { "is_live": "2" } });

        let eastCount = await Elastic.get_entities_count_filter("", "project", filters);


        let West = await Filters.project_filters(Object.assign({}, req.body.query, {
            facing: "West",
            view: "partial"
        }));
        West.must.push({ "term": { "is_live": "2" } });

        let westCount = await Elastic.get_entities_count_filter("", "project", West);

        let North = await Filters.project_filters(Object.assign({}, req.body.query, {
            facing: "North",
            view: "partial"
        }));
        North.must.push({ "term": { "is_live": "2" } });

        let northCount = await Elastic.get_entities_count_filter("", "project", North);

        let South = await Filters.project_filters(Object.assign({}, req.body.query, {
            facing: "South",
            view: "partial"
        }));
        South.must.push({ "term": { "is_live": "2" } });

        let southCount = await Elastic.get_entities_count_filter("", "project", South);

        let NorthEast = await Filters.project_filters(Object.assign({}, req.body.query, {
            facing: "North-East",
            view: "partial"
        }));
        NorthEast.must.push({ "term": { "is_live": "2" } });

        let northEastCount = await Elastic.get_entities_count_filter("", "project", NorthEast);

        let northWest = await Filters.project_filters(Object.assign({}, req.body.query, {
            facing: "North-West",
            view: "partial"
        }));
        northWest.must.push({ "term": { "is_live": "2" } });

        let northWestCount = await Elastic.get_entities_count_filter("", "project", northWest);

        let southEast = await Filters.project_filters(Object.assign({}, req.body.query, {
            facing: "South-East",
            view: "partial"
        }));
        southEast.must.push({ "term": { "is_live": "2" } });

        let southEastCount = await Elastic.get_entities_count_filter("", "project", southEast);

        let SouthWest = await Filters.project_filters(Object.assign({}, req.body.query, {
            facing: "South-West",
            view: "partial"
        }));
        SouthWest.must.push({ "term": { "is_live": "2" } });

        let southWestCount = await Elastic.get_entities_count_filter("", "project", SouthWest);

        res.status(200).json({
            success: true,
            data: {
                eastCount,
                westCount,
                northCount,
                southCount,
                northEastCount,
                northWestCount,
                southEastCount,
                southWestCount
            }
        });

    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});

router.post("/dynamicFacing", async (req, res) => {
    try {



        req.body.query = JSON.parse(req.body.query)
        let facing = [{
            facing: "East",
            view: "partial"
        }, {
            facing: "West",
            view: "partial"
        }, {
            facing: "North",
            view: "partial"
        }, {
            facing: "South",
            view: "partial"
        }, {
            facing: "North-East",
            view: "partial"
        }, {
            facing: "North-West",
            view: "partial"
        }, {
            facing: "South-East",
            view: "partial"
        }, {
            facing: "South-West",
            view: "partial"
        }]
        await asyncForEach(facing, async (stat) => {
            let filters = await Filters.project_filters(Object.assign({}, req.body.query, stat));
            filters.must.push({ "term": { "is_live": "2" } });
            stat.count = await Elastic.get_entities_count_filter("", "project", filters);
            stat.nameAsURL = "facing-" + stat.facing.split(" ").join("-").toLowerCase();
        });

        facing.sort((a, b) => {
            return b.count - a.count;
        });


        res.render('pages/v1/partials/filters/facing-filter-card', { facing });



    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});


router.post("/dynamicFacing_property", async (req, res) => {
    try {



        req.body.query = JSON.parse(req.body.query)
        let facing = [{
            facing: "East",
            view: "partial"
        }, {
            facing: "West",
            view: "partial"
        }, {
            facing: "North",
            view: "partial"
        }, {
            facing: "South",
            view: "partial"
        }, {
            facing: "North-East",
            view: "partial"
        }, {
            facing: "North-West",
            view: "partial"
        }, {
            facing: "South-East",
            view: "partial"
        }, {
            facing: "South-West",
            view: "partial"
        }]
        await asyncForEach(facing, async (stat) => {
            let filters = await Filters.property_filters(Object.assign({}, req.body.query, stat));
            filters.must.push({ "term": { "is_live": "2" } });
            stat.count = await Elastic.get_entities_count_filter("", "property", filters);
            stat.nameAsURL = "facing-" + stat.facing.split(" ").join("-").toLowerCase();
        });

        facing.sort((a, b) => {
            return b.count - a.count;
        });


        res.render('pages/v1/partials/filters/facing-filter-card', { facing });



    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});

router.post("/location_type", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query)
        let filters = Filters.location_filters(Object.assign({}, req.body.query, {
            location_type: "state",
            view: "partial"
        }));
        filters.must.push({ "term": { "is_live": "2" } });

        let stateCount = await Elastic.get_entities_count_filter("", "location", filters);

        let district = Filters.location_filters(Object.assign({}, req.body.query, {
            location_type: "district",
            view: "partial"
        }));
        district.must.push({ "term": { "is_live": "2" } });

        let districtCount = await Elastic.get_entities_count_filter("", "location", district);

        let city = Filters.location_filters(Object.assign({}, req.body.query, {
            location_type: "city",
            view: "partial"
        }));
        city.must.push({ "term": { "is_live": "2" } });

        let cityCount = await Elastic.get_entities_count_filter("", "location", city);

        let subcity = Filters.location_filters(Object.assign({}, req.body.query, {
            location_type: "subcity",
            view: "partial"
        }));
        subcity.must.push({ "term": { "is_live": "2" } });

        let subcityCount = await Elastic.get_entities_count_filter("", "location", subcity);




        res.status(200).json({
            success: true,
            data: {
                subcityCount,
                cityCount,
                districtCount,
                stateCount
            }
        });

    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});

router.post("/dynamicLocation_type", async (req, res) => {
    try {

        // req.body.query = JSON.parse(req.body.query)

        req.body.query = JSON.parse(req.body.query)
        let location_type = [{
            location_type: "state",
            view: "partial"
        }, {
            location_type: "district",
            view: "partial"
        }, {
            location_type: "city",
            view: "partial"
        }, {
            location_type: "subcity",
            view: "partial"
        }]

        await asyncForEach(location_type, async (stat) => {
            let filters = Filters.location_filters(Object.assign({}, req.body.query, stat));
            filters.must.push({ "term": { "is_live": "2" } });
            stat.count = await Elastic.get_entities_count_filter("", "location", filters);
            stat.nameAsURL = "location_type-" + stat.location_type.split(" ").join("-").toLowerCase();
        });



        location_type.sort((a, b) => {
            return b.count - a.count;
        });


        res.render('pages/v1/partials/filters/location_type-filter-card', { location_type });

    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});

router.post("/facing_property", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query)
        let filters = await Filters.property_filters(Object.assign({}, req.body.query, {
            facing: "East",
            view: "partial"
        }));
        filters.must.push({ "term": { "is_live": "2" } });

        let eastCount = await Elastic.get_entities_count_filter("", "property", filters);


        let West = await Filters.property_filters(Object.assign({}, req.body.query, {
            facing: "West",
            view: "partial"
        }));
        West.must.push({ "term": { "is_live": "2" } });

        let westCount = await Elastic.get_entities_count_filter("", "property", West);

        let North = await Filters.property_filters(Object.assign({}, req.body.query, {
            facing: "North",
            view: "partial"
        }));
        North.must.push({ "term": { "is_live": "2" } });

        let northCount = await Elastic.get_entities_count_filter("", "property", North);

        let South = await Filters.property_filters(Object.assign({}, req.body.query, {
            facing: "South",
            view: "partial"
        }));
        South.must.push({ "term": { "is_live": "2" } });

        let southCount = await Elastic.get_entities_count_filter("", "property", South);

        let NorthEast = await Filters.property_filters(Object.assign({}, req.body.query, {
            facing: "North-East",
            view: "partial"
        }));
        NorthEast.must.push({ "term": { "is_live": "2" } });

        let northEastCount = await Elastic.get_entities_count_filter("", "property", NorthEast);

        let northWest = await Filters.property_filters(Object.assign({}, req.body.query, {
            facing: "North-West",
            view: "partial"
        }));
        northWest.must.push({ "term": { "is_live": "2" } });

        let northWestCount = await Elastic.get_entities_count_filter("", "property", northWest);

        let southEast = await Filters.property_filters(Object.assign({}, req.body.query, {
            facing: "South-East",
            view: "partial"
        }));
        southEast.must.push({ "term": { "is_live": "2" } });

        let southEastCount = await Elastic.get_entities_count_filter("", "property", southEast);

        let SouthWest = await Filters.property_filters(Object.assign({}, req.body.query, {
            facing: "South-West",
            view: "partial"
        }));
        SouthWest.must.push({ "term": { "is_live": "2" } });

        let southWestCount = await Elastic.get_entities_count_filter("", "property", SouthWest);

        res.status(200).json({
            success: true,
            data: {
                eastCount,
                westCount,
                northCount,
                southCount,
                northEastCount,
                northWestCount,
                southEastCount,
                southWestCount
            }
        });

    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});

router.post("/price", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query);
        let filters = await Filters.project_filters(Object.assign({}, req.body.query, {
            price: "0 to 25 lacs",
            view: "partial"
        }));
        filters.must.push({ "term": { "is_live": "2" } });

        let zeroToTwentyFiveCount = await Elastic.get_entities_count_filter("", "project", filters);

        let twentyFiveToFifty = await Filters.project_filters(Object.assign({}, req.body.query, {
            price: "25 lacs to 50 lacs",
            view: "partial"
        }));
        twentyFiveToFifty.must.push({ "term": { "is_live": "2" } });

        let twentyFiveToFiftyCount = await Elastic.get_entities_count_filter("", "project", twentyFiveToFifty);

        let fiftyToOne = await Filters.project_filters(Object.assign({}, req.body.query, {
            price: "50 lacs to 1 cr",
            view: "partial"
        }));
        fiftyToOne.must.push({ "term": { "is_live": "2" } });

        let fiftyToOneCount = await Elastic.get_entities_count_filter("", "project", fiftyToOne);


        let oneToFive = await Filters.project_filters(Object.assign({}, req.body.query, {
            price: "1 cr to 5 cr",
            view: "partial"
        }));
        oneToFive.must.push({ "term": { "is_live": "2" } });

        let oneToFiveCount = await Elastic.get_entities_count_filter("", "project", oneToFive);

        let fiveToAbove = await Filters.project_filters(Object.assign({}, req.body.query, {
            price: "5 cr and above",
            view: "partial"
        }));
        fiveToAbove.must.push({ "term": { "is_live": "2" } });

        let fiveToAboveCount = await Elastic.get_entities_count_filter("", "project", fiveToAbove);

        res.status(200).json({
            success: true,
            data: {
                zeroToTwentyFiveCount,
                twentyFiveToFiftyCount,
                fiftyToOneCount,
                oneToFiveCount,
                fiveToAboveCount,
            }
        });

    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});
router.post("/dynamicPrice", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query);
        let price = [{
            price: "0 to 25 lacs",
            view: "partial"
        }, {
            price: "25 lacs to 50 lacs",
            view: "partial"
        }, {
            price: "50 lacs to 1 cr",
            view: "partial"
        }, {
            price: "1 cr to 5 cr",
            view: "partial"
        }, {
            price: "5 cr and above",
            view: "partial"
        }]


        await asyncForEach(price, async (stat) => {
            let filters = await Filters.project_filters(Object.assign({}, req.body.query, stat));
            filters.must.push({ "term": { "is_live": "2" } });
            stat.count = await Elastic.get_entities_count_filter("", "project", filters);
            stat.nameAsURL = "price-" + stat.price.split(" ").join("-").toLowerCase();
        });


        price.sort((a, b) => {
            return b.count - a.count;
        });

        res.render('pages/v1/partials/filters/price-filter-card', { price });


    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});

router.post("/dynamicPrice_property", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query);
        let price = [{
            price: "0 to 25 lacs",
            view: "partial"
        }, {
            price: "25 lacs to 50 lacs",
            view: "partial"
        }, {
            price: "50 lacs to 1 cr",
            view: "partial"
        }, {
            price: "1 cr to 5 cr",
            view: "partial"
        }, {
            price: "5 cr and above",
            view: "partial"
        }]


        await asyncForEach(price, async (stat) => {
            let filters = await Filters.property_filters(Object.assign({}, req.body.query, stat));
            filters.must.push({ "term": { "is_live": "2" } });
            stat.count = await Elastic.get_entities_count_filter("", "property", filters);
            stat.nameAsURL = "price-" + stat.price.split(" ").join("-").toLowerCase();
        });


        price.sort((a, b) => {
            return b.count - a.count;
        });

        res.render('pages/v1/partials/filters/price-filter-card', { price });


    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});


router.post("/price_property", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query);
        let filters = await Filters.property_filters(Object.assign({}, req.body.query, {
            price: "0 to 25 lacs",
            view: "partial"
        }));
        filters.must.push({ "term": { "is_live": "2" } });

        let zeroToTwentyFiveCount = await Elastic.get_entities_count_filter("", "property", filters);

        let twentyFiveToFifty = await Filters.property_filters(Object.assign({}, req.body.query, {
            price: "25 lacs to 50 lacs",
            view: "partial"
        }));
        twentyFiveToFifty.must.push({ "term": { "is_live": "2" } });

        let twentyFiveToFiftyCount = await Elastic.get_entities_count_filter("", "property", twentyFiveToFifty);

        let fiftyToOne = await Filters.property_filters(Object.assign({}, req.body.query, {
            price: "50 lacs to 1 cr",
            view: "partial"
        }));
        fiftyToOne.must.push({ "term": { "is_live": "2" } });

        let fiftyToOneCount = await Elastic.get_entities_count_filter("", "property", fiftyToOne);


        let oneToFive = await Filters.property_filters(Object.assign({}, req.body.query, {
            price: "1 cr to 5 cr",
            view: "partial"
        }));
        oneToFive.must.push({ "term": { "is_live": "2" } });

        let oneToFiveCount = await Elastic.get_entities_count_filter("", "property", oneToFive);

        let fiveToAbove = await Filters.property_filters(Object.assign({}, req.body.query, {
            price: "5 cr and above",
            view: "partial"
        }));
        fiveToAbove.must.push({ "term": { "is_live": "2" } });

        let fiveToAboveCount = await Elastic.get_entities_count_filter("", "property", fiveToAbove);

        res.status(200).json({
            success: true,
            data: {
                zeroToTwentyFiveCount,
                twentyFiveToFiftyCount,
                fiftyToOneCount,
                oneToFiveCount,
                fiveToAboveCount,
            }
        });

    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});

router.post("/area", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query)


        let filters = await Filters.project_filters(Object.assign({}, req.body.query, {
            area: "0 to 1000 sq ft",
            view: "partial"
        }));
        filters.must.push({ "term": { "is_live": "2" } });


        let zeroToTenCount = await Elastic.get_entities_count_filter("", "project", filters);

        let filters1 = await Filters.project_filters(Object.assign({}, req.body.query, {
            area: "1000 to 1500 sq ft",
            view: "partial"
        }));
        filters1.must.push({ "term": { "is_live": "2" } });


        let tenToFifteenCount = await Elastic.get_entities_count_filter("", "project", filters1);


        let fifteenToTwenty = await Filters.project_filters(Object.assign({}, req.body.query, {
            area: "1500 to 2000 sq ft",
            view: "partial"
        }));
        fifteenToTwenty.must.push({ "term": { "is_live": "2" } });


        let fifteenToTwentyCount = await Elastic.get_entities_count_filter("", "project", fifteenToTwenty);

        let twentyToAbove = await Filters.project_filters(Object.assign({}, req.body.query, {
            area: "2000 sq ft and above",
            view: "partial"
        }));
        twentyToAbove.must.push({ "term": { "is_live": "2" } });

        let twentyToAboveCount = await Elastic.get_entities_count_filter("", "project", twentyToAbove);

        res.status(200).json({
            success: true,
            data: {
                zeroToTenCount,
                tenToFifteenCount,
                fifteenToTwentyCount,
                twentyToAboveCount,
            }
        });

    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});

router.post("/bhk", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query)
        console.log(req.body.query)

        let filters = await Filters.project_filters(Object.assign({}, req.body.query, {
            bhk: "1",
            view: "partial"
        }));
        filters.must.push({ "term": { "is_live": "2" } });
        console.log("2524", filters.must)

        let bhk1Count = await Elastic.get_entities_count_filter("", "project", filters);

        let filters1 = await Filters.project_filters(Object.assign({}, req.body.query, {
            bhk: "2",
            view: "partial"
        }));
        filters1.must.push({ "term": { "is_live": "2" } });
        console.log("2525", filters1.must)

        let bhk2Count = await Elastic.get_entities_count_filter("", "project", filters1);

        let bhk3 = await Filters.project_filters(Object.assign({}, req.body.query, {
            bhk: "3",
            view: "partial"
        }));
        bhk3.must.push({ "term": { "is_live": "2" } });
        console.log("2526", bhk3.must)

        let bhk3Count = await Elastic.get_entities_count_filter("", "project", bhk3);

        let bhk4 = await Filters.project_filters(Object.assign({}, req.body.query, {
            bhk: "4",
            view: "partial"
        }));
        bhk4.must.push({ "term": { "is_live": "2" } });
        console.log("2526", bhk4.must)

        let bhk4Count = await Elastic.get_entities_count_filter("", "project", bhk4);

        let bhk5to10 = await Filters.project_filters(Object.assign({}, req.body.query, {
            bhk: "5-to-10",
            view: "partial"
        }));
        bhk5to10.must.push({ "term": { "is_live": "2" } });
        console.log("2526", bhk5to10.must)

        let bhk5to10Count = await Elastic.get_entities_count_filter("", "project", bhk5to10);

        let bhkOthers = await Filters.project_filters(Object.assign({}, req.body.query, {
            bhk: "others",
            view: "partial"
        }));
        bhkOthers.must.push({ "term": { "is_live": "2" } });
        console.log("2526", bhkOthers.must)

        let bhkOthersCount = await Elastic.get_entities_count_filter("", "project", bhkOthers);

        res.status(200).json({
            success: true,
            data: {
                bhk1Count,
                bhk2Count,
                bhk3Count,
                bhk4Count,
                bhk5to10Count,
                bhkOthersCount
            }
        });

    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});


router.post("/dynamicArea", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query)

        let area = [{
            area: "0 to 1000 sq ft",
            view: "partial"
        }, {
            area: "1000 to 1500 sq ft",
            view: "partial"
        }, {
            area: "1500 to 2000 sq ft",
            view: "partial"
        }, {
            area: "2000 sq ft and above",
            view: "partial"
        }]

        await asyncForEach(area, async (stat) => {
            let filters = await Filters.project_filters(Object.assign({}, req.body.query, stat));
            filters.must.push({ "term": { "is_live": "2" } });
            stat.count = await Elastic.get_entities_count_filter("", "project", filters);
            stat.nameAsURL = "area-" + stat.area.split(" ").join("-").toLowerCase();
        });


        area.sort((a, b) => {
            return b.count - a.count;
        });


        res.render('pages/v1/partials/filters/area-filter-card', { area });


    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});

router.post("/dynamicArea_property", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query)

        let area = [{
            area: "0 to 1000 sq ft",
            view: "partial"
        }, {
            area: "1000 to 1500 sq ft",
            view: "partial"
        }, {
            area: "1500 to 2000 sq ft",
            view: "partial"
        }, {
            area: "2000 sq ft and above",
            view: "partial"
        }]

        await asyncForEach(area, async (stat) => {
            let filters = await Filters.property_filters(Object.assign({}, req.body.query, stat));
            filters.must.push({ "term": { "is_live": "2" } });
            stat.count = await Elastic.get_entities_count_filter("", "property", filters);
            stat.nameAsURL = "area-" + stat.area.split(" ").join("-").toLowerCase();
        });


        area.sort((a, b) => {
            return b.count - a.count;
        });


        res.render('pages/v1/partials/filters/area-filter-card', { area });


    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});

router.post("/area_property", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query)
        console.log(req.body.query)

        let filters = await Filters.property_filters(Object.assign({}, req.body.query, {
            area: "0 to 1000 sq ft",
            view: "partial"
        }));
        filters.must.push({ "term": { "is_live": "2" } });
        console.log("2524", filters.must)

        let zeroToTenCount = await Elastic.get_entities_count_filter("", "property", filters);

        let filters1 = await Filters.property_filters(Object.assign({}, req.body.query, {
            area: "1000 to 1500 sq ft",
            view: "partial"
        }));
        filters1.must.push({ "term": { "is_live": "2" } });
        console.log("2525", filters1.must)

        let tenToFifteenCount = await Elastic.get_entities_count_filter("", "property", filters1);


        let fifteenToTwenty = await Filters.property_filters(Object.assign({}, req.body.query, {
            area: "1500 to 2000 sq ft",
            view: "partial"
        }));
        fifteenToTwenty.must.push({ "term": { "is_live": "2" } });
        console.log("2526", fifteenToTwenty.must)

        let fifteenToTwentyCount = await Elastic.get_entities_count_filter("", "property", fifteenToTwenty);

        let twentyToAbove = await Filters.property_filters(Object.assign({}, req.body.query, {
            area: "2000 sq ft and above",
            view: "partial"
        }));
        twentyToAbove.must.push({ "term": { "is_live": "2" } });
        console.log("2526", twentyToAbove.must)

        let twentyToAboveCount = await Elastic.get_entities_count_filter("", "property", twentyToAbove);

        res.status(200).json({
            success: true,
            data: {
                zeroToTenCount,
                tenToFifteenCount,
                fifteenToTwentyCount,
                twentyToAboveCount,
            }
        });

    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});

router.post("/bhk_property", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query)
        console.log(req.body.query)

        let filters = await Filters.property_filters(Object.assign({}, req.body.query, {
            bhk: "1",
            view: "partial"
        }));
        filters.must.push({ "term": { "is_live": "2" } });
        console.log("2524", filters.must)

        let bhk1Count = await Elastic.get_entities_count_filter("", "property", filters);

        let filters1 = await Filters.property_filters(Object.assign({}, req.body.query, {
            bhk: "2",
            view: "partial"
        }));
        filters1.must.push({ "term": { "is_live": "2" } });
        console.log("2525", filters1.must)

        let bhk2Count = await Elastic.get_entities_count_filter("", "property", filters1);


        let bhk3 = await Filters.property_filters(Object.assign({}, req.body.query, {
            bhk: "3",
            view: "partial"
        }));
        bhk3.must.push({ "term": { "is_live": "2" } });
        console.log("2526", bhk3.must)

        let bhk3Count = await Elastic.get_entities_count_filter("", "property", bhk3);

        let bhk4 = await Filters.property_filters(Object.assign({}, req.body.query, {
            bhk: "4",
            view: "partial"
        }));
        bhk4.must.push({ "term": { "is_live": "2" } });
        console.log("2526", bhk4.must)

        let bhk4Count = await Elastic.get_entities_count_filter("", "property", bhk4);

        let bhk5to10 = await Filters.property_filters(Object.assign({}, req.body.query, {
            bhk: "5-to-10",
            view: "partial"
        }));
        bhk5to10.must.push({ "term": { "is_live": "2" } });
        console.log("2526", bhk5to10.must)

        let bhk5to10Count = await Elastic.get_entities_count_filter("", "property", bhk5to10);

        let bhkOthers = await Filters.property_filters(Object.assign({}, req.body.query, {
            bhk: "others",
            view: "partial"
        }));
        bhkOthers.must.push({ "term": { "is_live": "2" } });
        console.log("2526", bhkOthers.must)

        let bhkOthersCount = await Elastic.get_entities_count_filter("", "property", bhkOthers);

        res.status(200).json({
            success: true,
            data: {
                bhk1Count,
                bhk2Count,
                bhk3Count,
                bhk4Count,
                bhk5to10Count,
                bhkOthersCount
            }
        });

    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});


router.post("/deal_type_property", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query)
        let filters = await Filters.property_filters(Object.assign({}, req.body.query, {
            condition: "fresh",
            view: "partial"
        }));
        filters.must.push({ "term": { "is_live": "2" } });

        let freshCount = await Elastic.get_entities_count_filter("", "property", filters);


        let West = await Filters.property_filters(Object.assign({}, req.body.query, {
            condition: "resale",
            view: "partial"
        }));
        West.must.push({ "term": { "is_live": "2" } });

        let resaleCount = await Elastic.get_entities_count_filter("", "property", West);

        res.status(200).json({
            success: true,
            data: {
                freshCount,
                resaleCount
            }
        });

    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});


router.post("/dynamic_deal_type_property", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query)
        let condition = [{
            condition: "fresh",
            view: "partial"
        }, {
            condition: "resale",
            view: "partial"
        }]
        await asyncForEach(condition, async (stat) => {
            let filters = await Filters.property_filters(Object.assign({}, req.body.query, stat));
            filters.must.push({ "term": { "is_live": "2" } });
            stat.count = await Elastic.get_entities_count_filter("", "property", filters);
            stat.nameAsURL = "condition-" + stat.condition.split(" ").join("-").toLowerCase();
        });

        condition.sort((a, b) => {
            return b.count - a.count;
        });


        res.render('pages/v1/partials/filters/condition-filter-card', { condition });


    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});
router.post("/authority_type", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query)
        let filters = Filters.authority_filters(Object.assign({}, req.body.query, {
            district: "Bengaluru Urban",
            view: "partial"
        }));
        filters.must.push({ "term": { "is_live": "2" } });

        let bengaluruCount = await Elastic.get_entities_count_filter("", "authority", filters);

        let gautam = Filters.authority_filters(Object.assign({}, req.body.query, {
            district: "Gautambudh Nagar",
            view: "partial"
        }));
        gautam.must.push({ "term": { "is_live": "2" } });

        let gautamCount = await Elastic.get_entities_count_filter("", "authority", gautam);

        let mumbai = Filters.authority_filters(Object.assign({}, req.body.query, {
            district: "Mumbai Suburban",
            view: "partial"
        }));
        mumbai.must.push({ "term": { "is_live": "2" } });

        let mumbaiCount = await Elastic.get_entities_count_filter("", "authority", mumbai);

        let meerut = Filters.authority_filters(Object.assign({}, req.body.query, {
            district: "Meerut",
            view: "partial"
        }));
        meerut.must.push({ "term": { "is_live": "2" } });

        let meerutCount = await Elastic.get_entities_count_filter("", "authority", meerut);

        let ghaziabad = Filters.authority_filters(Object.assign({}, req.body.query, {
            district: "Ghaziabad",
            view: "partial"
        }));
        ghaziabad.must.push({ "term": { "is_live": "2" } });

        let ghaziabadCount = await Elastic.get_entities_count_filter("", "authority", ghaziabad);






        res.status(200).json({
            success: true,
            data: {
                bengaluruCount,
                gautamCount,
                mumbaiCount,
                meerutCount,
                ghaziabadCount

            }
        });

    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});


router.post("/dynamicAuthority_type", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query)

        let district = [{
            district: "Bengaluru Urban",
            view: "partial"
        }, {
            district: "Gautambudh Nagar",
            view: "partial"
        }, {
            district: "Mumbai Suburban",
            view: "partial"
        }, {
            district: "Meerut",
            view: "partial"
        }, {
            district: "Ghaziabad",
            view: "partial"
        },
        {
            district: "Banglore",
            view: "partial"
        }]


        await asyncForEach(district, async (stat) => {
            let filters = Filters.authority_filters(Object.assign({}, req.body.query, stat));
            filters.must.push({ "term": { "is_live": "2" } });
            stat.count = await Elastic.get_entities_count_filter("", "authority", filters);
            stat.nameAsURL = "district-" + stat.district.split(" ").join("-").toLowerCase();
        });

        district.sort((a, b) => {
            return b.count - a.count;
        });


        res.render('pages/v1/partials/filters/district-filter-card', { district });
        // let filters = Filters.authority_filters(Object.assign({}, req.body.query, {
        //     district: "Bengaluru Urban",
        //     view: "partial"
        // }));
        // filters.must.push({ "term": { "is_live": "2" } });

        // let bengaluruCount = await Elastic.get_entities_count_filter("", "authority", filters);

        // let gautam = Filters.authority_filters(Object.assign({}, req.body.query, {
        //     district: "Gautambudh Nagar",
        //     view: "partial"
        // }));
        // gautam.must.push({ "term": { "is_live": "2" } });

        // let gautamCount = await Elastic.get_entities_count_filter("", "authority", gautam);

        // let mumbai = Filters.authority_filters(Object.assign({}, req.body.query, {
        //     district: "Mumbai Suburban",
        //     view: "partial"
        // }));
        // mumbai.must.push({ "term": { "is_live": "2" } });

        // let mumbaiCount = await Elastic.get_entities_count_filter("", "authority", mumbai);

        // let meerut = Filters.authority_filters(Object.assign({}, req.body.query, {
        //     district: "Meerut",
        //     view: "partial"
        // }));
        // meerut.must.push({ "term": { "is_live": "2" } });

        // let meerutCount = await Elastic.get_entities_count_filter("", "authority", meerut);

        // let ghaziabad = Filters.authority_filters(Object.assign({}, req.body.query, {
        //     district: "Ghaziabad",
        //     view: "partial"
        // }));
        // ghaziabad.must.push({ "term": { "is_live": "2" } });

        // let ghaziabadCount = await Elastic.get_entities_count_filter("", "authority", ghaziabad);






        // res.status(200).json({
        //     success: true,
        //     data: {
        //         bengaluruCount,
        //         gautamCount,
        //         mumbaiCount,
        //         meerutCount,
        //         ghaziabadCount

        //     }
        // });

    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});

router.post("/bank_type", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query)
        let filters = Filters.bank_filters(Object.assign({}, req.body.query, {
            type: "Nationalized",
            view: "partial"
        }));
        filters.must.push({ "term": { "is_live": "2" } });

        let nationalizedCount = await Elastic.get_entities_count_filter("", "bank", filters);

        let private = Filters.bank_filters(Object.assign({}, req.body.query, {
            type: "Private",
            view: "partial"
        }));
        private.must.push({ "term": { "is_live": "2" } });

        let privateCount = await Elastic.get_entities_count_filter("", "bank", private);

        let finance = Filters.bank_filters(Object.assign({}, req.body.query, {
            type: "Financial Company",
            view: "partial"
        }));
        finance.must.push({ "term": { "is_live": "2" } });

        let financeCount = await Elastic.get_entities_count_filter("", "bank", finance);



        let nbfc = Filters.bank_filters(Object.assign({}, req.body.query, {
            type: "nbfcs",
            view: "partial"
        }));
        nbfc.must.push({ "term": { "is_live": "2" } });

        let nbfcsCount = await Elastic.get_entities_count_filter("", "bank", nbfc);






        res.status(200).json({
            success: true,
            data: {
                nationalizedCount,
                privateCount,
                financeCount,
                nbfcsCount


            }
        });

    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});

router.post("/dynamicbank_type", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query)
        let bank = [{
            type: "Nationalized",
            view: "partial"
        }, {
            type: "Private",
            view: "partial"
        }, {
            type: "Financial Company",
            view: "partial"
        }, {
            type: "nbfcs",
            view: "partial"
        }]

        await asyncForEach(bank, async (stat) => {
            let filters = Filters.bank_filters(Object.assign({}, req.body.query, stat));
            filters.must.push({ "term": { "is_live": "2" } });
            stat.count = await Elastic.get_entities_count_filter("", "bank", filters);
            stat.nameAsURL = "type-" + stat.type.split(" ").join("-").toLowerCase();
        });

        bank.sort((a, b) => {
            return b.count - a.count;
        });

        res.render('pages/v1/partials/filters/bank-filter-card', { bank });



    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});


router.post("/local_presence", async (req, res) => {
    try {

        req.body.query = JSON.parse(req.body.query)

        console.log("req.body.query", req.body.query)
        let filters = Filters.builder_filters(Object.assign({}, req.body.query, {
            presence: "Noida",
            view: "partial"
        }));
        filters.must.push({ "term": { "is_live": "2" } });

        let noidaCount = await Elastic.get_entities_count_filter("", "builder", filters);

        let delhi = Filters.builder_filters(Object.assign({}, req.body.query, {
            presence: "New Delhi",
            view: "partial"
        }));
        delhi.must.push({ "term": { "is_live": "2" } });

        let delhiCount = await Elastic.get_entities_count_filter("", "builder", delhi);

        let bangalore = Filters.builder_filters(Object.assign({}, req.body.query, {
            presence: "Bangalore",
            view: "partial"
        }));
        bangalore.must.push({ "term": { "is_live": "2" } });

        let bangaloreCount = await Elastic.get_entities_count_filter("", "builder", bangalore);

        let grnoida = Filters.builder_filters(Object.assign({}, req.body.query, {
            presence: "Greater Noida",
            view: "partial"
        }));
        grnoida.must.push({ "term": { "is_live": "2" } });

        let grnoidaCount = await Elastic.get_entities_count_filter("", "builder", grnoida);









        res.status(200).json({
            success: true,
            data: {
                noidaCount,
                delhiCount,
                bangaloreCount,
                grnoidaCount


            }
        });

    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});


router.post("/dynamiclocal_presence", async (req, res) => {
    try {

        let builderData = await Builder.find({ is_live: "2" });
        let presenceArray = [];

        builderData = JSON.parse(JSON.stringify(builderData))

        builderData.forEach((builder) => {
            builder = builder.local_presence
            presenceArray.push(...builder)
        })
        let data = []

        presenceArray = [...new Set(presenceArray)];
        //console.log("builderData", presenceArray)
        presenceArray.map((presence) => {

            data.push({ presence, view: "partial" })
        })

        let presence = data
        //console.log("builderData", presence)
        // let districtData = await District.find({});

        // districtData = JSON.parse(JSON.stringify(districtData))

        // districtData.forEach((district) => {
        //     //district = district.name
        //     districtArray.push(district.name)
        // })

        // districtArray = [...new Set(districtArray)];
        // console.log("builderData", districtArray)
        // req.body.query = JSON.parse(req.body.query)
        // let presence = [{
        //     presence: "New Delhi",
        //     view: "partial"
        // }, {
        //     presence: "Noida",
        //     view: "partial"
        // }, {
        //     presence: "Bangalore",
        //     view: "partial"
        // }, {
        //     presence: "Greater Noida",
        //     view: "partial"
        // }]
        await asyncForEach(presence, async (stat) => {
            let filters = Filters.builder_filters(Object.assign({}, req.body.query, stat));
            filters.must.push({ "term": { "is_live": "2" } });
            stat.count = await Elastic.get_entities_count_filter("", "builder", filters);
            stat.nameAsURL = "presence-" + stat.presence.split(" ").join("-").toLowerCase();
        });

        presence.sort((a, b) => {
            return b.count - a.count;
        });


        res.render('pages/v1/partials/filters/presence-filter-card', { presence });

    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});
router.post("/project_count", async (req, res) => {
    try {

        // req.body.query = JSON.parse(req.body.query)
        // let filters = await Filters.property_filters(Object.assign({}, req.body.query, {
        //     project: "DLF Prime Towers",
        //     view: "partial"
        // }));
        // filters.must.push({ "term": { "is_live": "2" } });

        // let dlfCount = await Elastic.get_entities_count_filter("", "property", filters);

        // let ptown = await Filters.property_filters(Object.assign({}, req.body.query, {
        //     project: "Park Town",
        //     view: "partial"
        // }));
        // ptown.must.push({ "term": { "is_live": "2" } });

        // let ptownCount = await Elastic.get_entities_count_filter("", "property", ptown);

        // let pcresidence = await Filters.property_filters(Object.assign({}, req.body.query, {
        //     project: "Pareena Coban Residences",
        //     view: "partial"
        // }));
        // pcresidence.must.push({ "term": { "is_live": "2" } });

        // let pcresidenceCount = await Elastic.get_entities_count_filter("", "property", pcresidence);

        // let rplots = await Filters.property_filters(Object.assign({}, req.body.query, {
        //     project: "Ramprastha Plots",
        //     view: "partial"
        // }));
        // rplots.must.push({ "term": { "is_live": "2" } });

        // let rplotsCount = await Elastic.get_entities_count_filter("", "property", rplots);

        // let asapphire = await Filters.property_filters(Object.assign({}, req.body.query, {
        //     project: "Amrapali Sapphire",
        //     view: "partial"
        // }));
        // asapphire.must.push({ "term": { "is_live": "2" } });

        // let asapphireCount = await Elastic.get_entities_count_filter("", "property", asapphire);

        let query = req.body.q || "",
            skip = req.body.skip || 0,
            limit = req.body.limit || 1000;

        req.body.query = JSON.parse(req.body.query);

        let filters = await Filters.project_filters({});
        filters.must.push({ "term": { "is_live": "2" } })

        var sort = Filters.project_sort("propertyreverse")
        console.log("skip", skip)
        let data = await Elastic.get_entities(query, "project", limit, project_fields, filters, skip, sort)
        data.results = (Images.logo_img_url_list(data.results, "Projects"));

        data.results = data.results.map((lo) => {
            lo.nameAsURL = lo.name.split(" ").join("-").toLowerCase();
            lo.total_projects = lo.total_properties || 0
            return lo
        });

        await asyncForEach(data.results, async (ele) => {
            let eleFilter = await Filters.property_filters(Object.assign({}, req.body.query, {
                project: ele.name,
            }));
            eleFilter.must.push({ "term": { "is_live": "2" } });

            let eleFilterCount = await Elastic.get_entities_count_filter("", "property", eleFilter);
            ele.projectCount = eleFilterCount
        });

        data.results = data.results.filter((ele) => {
            return ele.projectCount > 0
        });

        data.results.sort((a, b) => {
            return b.projectCount - a.projectCount;
        });





        // res.render('partials/filters/authorities-filter-card', data);
        res.render('pages/v1/partials/filters/projects-filter-card', data);







        // res.status(200).json({
        //     success: true,
        //     data: {
        //         dlfCount,
        //         ptownCount,
        //         pcresidenceCount,
        //         rplotsCount,
        //         asapphireCount



        //     }
        // });

    } catch (error) {
        let message = error.message || "Something went wrong."
        res.status(500).json({
            success: false,
            message: message
        });
    }
});

module.exports = router;