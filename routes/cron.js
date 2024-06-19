const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
var ObjectId = require("mongoose").Types.ObjectId;
Elastic = require("../classes/elasticsearch");
Filters = require("../classes/filters");
const { default: slugify } = require("slugify");
const { slugifyOptions } = require("../appConstants");

const Authority = require("../models/authority.model");
const Project = require("../models/project.model");
const Bank = require("../models/bank.model");
const Builder = require("../models/builder.model");
const Property = require("../models/property.model");
const Tag = require("../models/tags.model");
const City = require("../models/city.model");
const Subcity = require("../models/subcity.model");
const State = require("../models/state.model");
const District = require("../models/district.model");
const Boundary = require("../models/boundary.model");
var axios = require("axios");

const { asyncForEach } = require("./utils");
const fs = require("fs");
module.exports = {
  updateAreaOfPropertyInProjects: async function () {
    // console.log('Start Updating area in project')
    // await Project.find({}).then(async (projectDocs) => {
    //     for (let i = 0; i < projectDocs.length; i++) { //PICK ONE PROJECT
    //         var project = projectDocs[i].name;
    //         await Property.find({ 'project': project, "is_live": "2" }).then(async (propDocs) => { // COUNT ALL THE PROPERTIES HAVING THIS PROJECT
    //             var areaArr = []
    //             for (var j = 0; j < propDocs.length; j++) {
    //                 if (propDocs[j].area && propDocs[j].area.area) {
    //                     areaArr.push(propDocs[j].area.area)
    //                 }
    //             }
    //             areaArr.sort(function (a, b) { return a - b });
    //             var areaTemp = {}
    //             if (areaArr.length > 0) {
    //                 console.log('areaArr: ', areaArr[0], areaArr[areaArr.length - 1])
    //                 areaTemp['min'] = areaArr[0]
    //                 areaTemp['max'] = areaArr[areaArr.length - 1]
    //             }
    //             if (projectDocs[i].area.area) { areaTemp.area = projectDocs[i].area.area }
    //             if (projectDocs[i].area.unit) { areaTemp.unit = projectDocs[i].area.unit }

    //             if (!areaTemp.min) { areaTemp.min = null }
    //             if (!areaTemp.max) { areaTemp.max = null }
    //             console.log('_________', areaTemp)

    //             await Project.findOneAndUpdate({ //PICK EACH PROJECT AND UPDATE ITS area OBJECT
    //                 _id: projectDocs[i]._id
    //             }, {
    //                 $set: {
    //                     area: areaTemp
    //                 }
    //             }, { "new": true }).then(async (data) => {
    //                 var clonedObj = { ...data };
    //                 delete clonedObj._doc._id
    //                 await Elastic.delete_entity({ match_phrase: { url: clonedObj._doc.url } }).then(async (resp) => {
    //                     clonedObj._doc.doc_type = "project"
    //                     clonedObj._doc.unique = 1;
    //                     await Elastic.create_entitiy(clonedObj._doc).then(async (resp) => {
    //                     }, async (err) => {
    //                         console.log('error white creating', err)
    //                     })
    //                 }, async (error) => {
    //                     console.log('error white deleting', error)
    //                 });

    //             }, (updateErr) => console.log("updateErr", updateErr));

    //         })
    //     }
    // })
    // console.log('***PRICE IN PROJECTS UPDATION DONE***');
    try {
      let projectDocs = await Project.find({ is_live: "2" });
      await asyncForEach(projectDocs, async (project) => {
        let propDocs = await Property.find({
          project: project.name,
          is_live: "2",
        });

        var areaArr = [];
        for (var j = 0; j < propDocs.length; j++) {
          if (propDocs[j].area && propDocs[j].area.area) {
            areaArr.push(propDocs[j].area.area);
          }
        }
        areaArr.sort(function (a, b) {
          return a - b;
        });
        var areaTemp = {};
        if (areaArr.length > 0) {
          console.log("areaArr: ", areaArr[0], areaArr[areaArr.length - 1]);
          areaTemp["min"] = areaArr[0];
          areaTemp["max"] = areaArr[areaArr.length - 1];
        }
        if (project.area.area) {
          areaTemp.area = project.area.area;
        }
        if (project.area.unit) {
          areaTemp.unit = project.area.unit;
        }

        if (!areaTemp.min) {
          areaTemp.min = null;
        }
        if (!areaTemp.max) {
          areaTemp.max = null;
        }
        console.log("_________", areaTemp);

        let data = await Project.findOneAndUpdate(
          {
            //PICK EACH PROJECT AND UPDATE ITS PRICE OBJECT
            _id: project._id,
          },
          {
            $set: {
              area: areaTemp,
            },
          },
          { new: true, timestamps: false }
        );

        var clonedObj = { ...data };
        delete clonedObj._doc._id;
        await Elastic.delete_entity_promise({
          match_phrase: { url: clonedObj._doc.url },
        });

        clonedObj._doc.doc_type = "project";
        clonedObj._doc.unique = 1;
        await Elastic.create_entitiy_promise(clonedObj._doc);

        console.log("updated Project", project.name);
      });
    } catch (error) {
      console.log("[Error updating area in project]", error);
    }
    console.log("***AREA IN PROJECTS UPDATION DONE***");
  },

  cloneAllProperties: async function () {
    try {
      let propertyDocs = await Property.find({ is_live: "2" });
      await asyncForEach(propertyDocs, async (property) => {
        let data = await Property.findOne({
          _id: property._id,
        });

        var clonedObj = { ...data };
        delete clonedObj._doc._id;
        await Elastic.delete_entity_promise({
          match_phrase: { url: clonedObj._doc.url },
        });

        clonedObj._doc.doc_type = "property";
        clonedObj._doc.unique = 1;
        await Elastic.create_entitiy_promise(clonedObj._doc);

        console.log("updated Property", property.name);
      });
    } catch (error) {
      console.log("[Error updating area in project]", error);
    }
    console.log("***AREA IN PROJECTS UPDATION DONE***");
  },

  updateProjectDetailsInProjects: async function () {
    try {
      let projectDocs = await Project.find({});
      await asyncForEach(projectDocs, async (project) => {
        let detailarea = [];
        if (project.details && project.details.length > 0) {
          await asyncForEach(project.details, async (detail) => {
            if (detail.area) {
              detailarea.push(detail.area);
            }
          });
        }

        detailarea.sort(function (a, b) {
          return a - b;
        });
        var areaTemp = {};

        if (detailarea.length > 0) {
          areaTemp["min"] = detailarea[0];
          areaTemp["max"] = detailarea[detailarea.length - 1];
        }

        if (!areaTemp.min) {
          areaTemp.min = null;
        }
        if (!areaTemp.max) {
          areaTemp.max = null;
        }

        let data = await Project.findOneAndUpdate(
          {
            _id: project._id,
          },
          {
            $set: {
              details_area: areaTemp,
            },
          },
          { new: true, timestamps: false }
        );

        var clonedObj = { ...data };
        delete clonedObj._doc._id;
        await Elastic.delete_entity_promise({
          match_phrase: { url: clonedObj._doc.url },
        });

        clonedObj._doc.doc_type = "project";
        clonedObj._doc.unique = 1;
        await Elastic.create_entitiy_promise(clonedObj._doc);
      });
    } catch (error) {
      console.log("[Error updating area in project]", error);
    }
    console.log("***AREA IN PROJECTS UPDATION DONE***");
  },
  /* UPDATE TOTAL NUMBER OF PROJECTS IN AUTHORITIES*/
  totalProjectsInAuthority: async function () {
    // await Authority.find({}).then(async (authDocs) => { // GET ALL AUTHORITIES
    //     for (let i = 0; i < authDocs.length; i++) { //PICK ONE AUTHORITY
    //         var authName = authDocs[i].name;
    //         await Project.find({ 'authority': authName, "is_live": "2" }).then(async (projDocs) => { // COUNT ALL THE PROJECTS HAVING THIS AUTHORITY
    //             var TotProjects = projDocs.length
    //             if (TotProjects == 0) {
    //                 TotProjects = null
    //             }
    //             await Authority.findOneAndUpdate({ //PICK EACH AUTHORITY AND UPDATE ITS TOTAL_PROJECTS COUNT
    //                 _id: authDocs[i]._id
    //             }, {
    //                 $set: {
    //                     total_projects: TotProjects
    //                 }
    //             }, { "new": true }).then(async (data) => {

    //                 var clonedObj = { ...data };
    //                 delete clonedObj._doc._id
    //                 await Elastic.delete_entity({ match_phrase: { url: clonedObj._doc.url } }).then(async (resp) => {
    //                     clonedObj._doc.doc_type = "authority"
    //                     clonedObj._doc.unique = 1;
    //                     await Elastic.create_entitiy(clonedObj._doc).then(async (resp) => {
    //                         // console.log('create resp**********************************', resp)
    //                     }, async (err) => {
    //                         console.log('error white creating', err)
    //                     })
    //                 }, async (error) => {
    //                     console.log('error white deleting', error)
    //                 });

    //             }, (updateErr) => console.log("updateErr", updateErr))
    //             // for (var j = 0; j < projDocs.length; j++) {}
    //         }, (projDocsErr) => console.log('projDocsErr', projDocsErr))
    //     }
    // }, (authDocsErr) => console.log('authDocsErr', authDocsErr))
    // console.log('**************************FINISHED***************************************')

    try {
      let authjDocs = await Authority.find({});
      await asyncForEach(authjDocs, async (authority) => {
        console.log("Start updating authority ", authority.name);
        let propDocs = await Project.find({
          authority: authority.name,
          is_live: "2",
        });
        var TotProjects = propDocs.length;
        if (TotProjects == 0) {
          TotProjects = null;
        }
        let data = await Authority.findOneAndUpdate(
          {
            //PICK EACH AUTHORITY AND UPDATE ITS PRICE OBJECT
            _id: authority._id,
          },
          {
            $set: {
              total_projects: TotProjects,
            },
          },
          { new: true, timestamps: false }
        );

        var clonedObj = { ...data };
        delete clonedObj._doc._id;

        await Elastic.delete_entity_promise({
          match_phrase: { url: clonedObj._doc.url },
        });
        clonedObj._doc.doc_type = "authority";
        clonedObj._doc.unique = 1;
        await Elastic.create_entitiy_promise(clonedObj._doc);
        console.log("Update authority successfully", authority.name);
      });
    } catch (error) {
      console.log("[Error updating projects in Authority]", error);
    }

    console.log("***PROJECTS IN AUTHORITY UPDATION DONE***");
  },
  /* UPDATE TOTAL NUMBER OF PROJECTS IN BANKS */
  totalProjectsInBank: async function () {
    await Bank.find({}).then(
      async (bankDocs) => {
        // GET ALL Banks
        for (let i = 0; i < bankDocs.length; i++) {
          //PICK ONE Bank
          var bank = bankDocs[i].name;
          console.log("bank name is :", bank.name);
          await Project.find({ banks: bank, is_live: "2" }).then(
            async (projDocs) => {
              // COUNT ALL THE PROJECTS HAVING THIS Bank

              var TotProjects = projDocs.length;
              if (TotProjects == 0) {
                TotProjects = null;
              }
              await Bank.findOneAndUpdate(
                {
                  //PICK EACH Bank AND UPDATE ITS TOTAL_PROJECTS COUNT
                  _id: bankDocs[i]._id,
                },
                {
                  $set: {
                    total_projects: TotProjects,
                  },
                },
                { new: true, timestamps: false }
              ).then(
                async (data) => {
                  // console.log('url is ', doc.url);
                  // console.log('***total Projects In Bank UPDATED***');

                  var clonedObj = { ...data };
                  delete clonedObj._doc._id;
                  await Elastic.delete_entity({
                    match_phrase: { url: clonedObj._doc.url },
                  }).then(
                    async (resp) => {
                      clonedObj._doc.doc_type = "bank";
                      clonedObj._doc.unique = 1;
                      await Elastic.create_entitiy(clonedObj._doc).then(
                        async (resp) => {
                          // console.log('create resp**********************************', resp)
                        },
                        async (err) => {
                          console.log("error white creating", err);
                        }
                      );
                    },
                    async (error) => {
                      console.log("error white deleting", error);
                    }
                  );
                },
                (updateErr) => console.log("updateErr", updateErr)
              );
            },
            (projDocsErr) => console.log("projDocsErr", projDocsErr)
          );
        }
      },
      (bankDocsErr) => console.log("bankDocsErr", bankDocsErr)
    );
  },
  /* UPDATE TOTAL NUMBER OF PROJECTS IN BUILDERS */
  totalProjectsInBuilder: async function () {
    await Builder.find({}).then(
      async (builderDocs) => {
        // GET ALL AUTHORITIES
        for (let i = 0; i < builderDocs.length; i++) {
          //PICK ONE BUILDER
          var builder = builderDocs[i].name;
          await Project.find({ builder: builder, is_live: "2" }).then(
            async (projDocs) => {
              // COUNT ALL THE PROJECTS HAVING THIS BUILDER
              // projDocs.length
              var TotProjects = projDocs.length;
              if (TotProjects == 0) {
                TotProjects = null;
              }
              console.log("projDocs.length : ", builder, projDocs.length);
              await Builder.findOneAndUpdate(
                {
                  //PICK EACH BUILDER AND UPDATE ITS TOTAL_PROJECTS COUNT
                  _id: builderDocs[i]._id,
                },
                {
                  $set: {
                    total_projects: TotProjects,
                  },
                },
                { new: true, timestamps: false }
              )
                .then(
                  async (data) => {
                    // console.log('***total Projects In Builder UPDATED***');

                    var clonedObj = { ...data };
                    delete clonedObj._doc._id;
                    await Elastic.delete_entity({
                      match_phrase: { url: clonedObj._doc.url },
                    }).then(
                      async (resp) => {
                        clonedObj._doc.doc_type = "builder";
                        clonedObj._doc.unique = 1;
                        await Elastic.create_entitiy(clonedObj._doc).then(
                          async (resp) => {
                            // console.log('create resp**********************************', resp)
                          },
                          async (err) => {
                            console.log("error white creating", err);
                          }
                        );
                      },
                      async (error) => {
                        console.log("error white deleting", error);
                      }
                    );
                  },
                  (updateErr) => console.log("updateErr", updateErr)
                )
                .catch((e) => {
                  console.log(e);
                });

              // for (var j = 0; j < projDocs.length; j++) {}
            },
            (projDocsErr) => console.log("projDocsErr", projDocsErr)
          );
        }
      },
      (builderDocsErr) => console.log("builderDocsErr", builderDocsErr)
    );
  },
  /* UPDATE PROJECT STATUS IN BUILDER E.G. UNDER CONSTRUCTION/READY TO MOVE/PRE LAUNCH */
  updateProjectStatusInBuilder: async function () {
    // await Builder.find({}).then(async (builderDocs) => { // GET ALL AUTHORITIES
    //   for (let i = 0; i < builderDocs.length; i++) { //PICK ONE BUILDER
    //     var builder = builderDocs[i].name;
    //     await Project.find({ 'builder': builder, "is_live": "2" }).then(async (projDocs) => { // COUNT ALL THE PROJECTS HAVING THIS BUILDER
    //       var readytomove = 0, underconstruction = 0, prelaunch = 0;
    //       var status = {};
    //       for (var j = 0; j < projDocs.length; j++) {
    //         // console.log('project status is :', )
    //         if (projDocs[j].project_status == "Ready To Move") {
    //           readytomove++;
    //         } else if (projDocs[j].project_status == "Under Construction") {
    //           underconstruction++;
    //         } else if (projDocs[j].project_status == "Pre Launch") {
    //           prelaunch++;
    //         }
    //       }
    //       if (prelaunch == 0) { prelaunch = null }
    //       if (underconstruction == 0) { underconstruction = null }
    //       if (readytomove == 0) { readytomove = null }
    //       status = {
    //         PreLaunch: prelaunch,
    //         UnderConstruction: underconstruction,
    //         ReadyToMove: readytomove
    //       }
    //       await Builder.findOneAndUpdate({ //PICK EACH BUILDER AND UPDATE ITS STATUS_PROJECT ARRAY
    //         _id: builderDocs[i]._id
    //       }, {
    //         $set: {
    //           project_status_count: status
    //         }
    //       }, { "new": true }).then(async (data) => {
    //         console.log('***Project Status updated In Builder UPDATED***');

    //         var clonedObj = { ...data };
    //         delete clonedObj._doc._id
    //         await Elastic.delete_entity({ match_phrase: { url: clonedObj._doc.url } }).then(async (resp) => {
    //           clonedObj._doc.doc_type = "builder"
    //           clonedObj._doc.unique = 1;
    //           await Elastic.create_entitiy(clonedObj._doc).then(async (resp) => {
    //             // console.log('create resp**********************************', resp)
    //           }, async (err) => {
    //             console.log('error white creating', err)
    //           })
    //         }, async (error) => {
    //           console.log('error white deleting', error)
    //         });

    //       }, (updateErr) => console.log("updateErr", updateErr));

    //     }, (projDocsErr) => console.log('projDocsErr', projDocsErr))
    //   }
    // }, (builderDocsErr) => console.log('builderDocsErr', builderDocsErr))

    let builderDocs = await Builder.find({});
    await asyncForEach(builderDocs, async (builder) => {
      try {
        let projDocs = await Project.find({
          builder: builder.name,
          is_live: "2",
        });

        var readytomove = 0,
          underconstruction = 0,
          prelaunch = 0;
        var status = {};
        var status_project = [];
        await asyncForEach(projDocs, async (project) => {
          if (project.project_status == "Ready To Move") {
            readytomove++;
          } else if (project.project_status == "Under Construction") {
            underconstruction++;
          } else if (project.project_status == "Pre Launch") {
            prelaunch++;
          }
        });
        if (prelaunch == 0) {
          prelaunch = null;
        }
        if (underconstruction == 0) {
          underconstruction = null;
        }
        if (readytomove == 0) {
          readytomove = null;
        }
        status = {
          PreLaunch: prelaunch,
          UnderConstruction: underconstruction,
          ReadyToMove: readytomove,
        };
        if (readytomove > 0) {
          status_project.push({ type: "Ready To Move", count: readytomove });
        }

        if (prelaunch > 0) {
          status_project.push({ type: "Pre Launch", count: prelaunch });
        }

        if (underconstruction > 0) {
          status_project.push({
            type: "Under Construction",
            count: underconstruction,
          });
        }

        console.log("status_project", status_project);

        let data = await Builder.findOneAndUpdate(
          {
            _id: builder._id,
          },
          {
            $set: {
              project_status_count: status,
              status_project: status_project,
            },
          },
          { new: true, timestamps: false }
        );

        var clonedObj = { ...data };
        delete clonedObj._doc._id;

        await Elastic.delete_entity({
          match_phrase: { url: clonedObj._doc.url },
        });
        clonedObj._doc.doc_type = "builder";
        clonedObj._doc.unique = 1;
        await Elastic.create_entitiy(clonedObj._doc);
      } catch (error) {
        console.log("[Error updating propertycount in State]", error);
      }
    });
  },

  /* UPDATE PROJECT STATUS IN BUILDER E.G. UNDER CONSTRUCTION/READY TO MOVE/PRE LAUNCH */
  updateProjectStatusInAuthority: async function () {
    // await Builder.find({}).then(async (builderDocs) => { // GET ALL AUTHORITIES
    //   for (let i = 0; i < builderDocs.length; i++) { //PICK ONE BUILDER
    //     var builder = builderDocs[i].name;
    //     await Project.find({ 'builder': builder, "is_live": "2" }).then(async (projDocs) => { // COUNT ALL THE PROJECTS HAVING THIS BUILDER
    //       var readytomove = 0, underconstruction = 0, prelaunch = 0;
    //       var status = {};
    //       for (var j = 0; j < projDocs.length; j++) {
    //         // console.log('project status is :', )
    //         if (projDocs[j].project_status == "Ready To Move") {
    //           readytomove++;
    //         } else if (projDocs[j].project_status == "Under Construction") {
    //           underconstruction++;
    //         } else if (projDocs[j].project_status == "Pre Launch") {
    //           prelaunch++;
    //         }
    //       }
    //       if (prelaunch == 0) { prelaunch = null }
    //       if (underconstruction == 0) { underconstruction = null }
    //       if (readytomove == 0) { readytomove = null }
    //       status = {
    //         PreLaunch: prelaunch,
    //         UnderConstruction: underconstruction,
    //         ReadyToMove: readytomove
    //       }
    //       await Builder.findOneAndUpdate({ //PICK EACH BUILDER AND UPDATE ITS STATUS_PROJECT ARRAY
    //         _id: builderDocs[i]._id
    //       }, {
    //         $set: {
    //           project_status_count: status
    //         }
    //       }, { "new": true }).then(async (data) => {
    //         console.log('***Project Status updated In Builder UPDATED***');

    //         var clonedObj = { ...data };
    //         delete clonedObj._doc._id
    //         await Elastic.delete_entity({ match_phrase: { url: clonedObj._doc.url } }).then(async (resp) => {
    //           clonedObj._doc.doc_type = "builder"
    //           clonedObj._doc.unique = 1;
    //           await Elastic.create_entitiy(clonedObj._doc).then(async (resp) => {
    //             // console.log('create resp**********************************', resp)
    //           }, async (err) => {
    //             console.log('error white creating', err)
    //           })
    //         }, async (error) => {
    //           console.log('error white deleting', error)
    //         });

    //       }, (updateErr) => console.log("updateErr", updateErr));

    //     }, (projDocsErr) => console.log('projDocsErr', projDocsErr))
    //   }
    // }, (builderDocsErr) => console.log('builderDocsErr', builderDocsErr))

    try {
      let authDocs = await Authority.find({});
      await asyncForEach(authDocs, async (authority) => {
        let projDocs = await Project.find({
          authority: authority.name,
          is_live: "2",
        });

        var readytomove = 0,
          underconstruction = 0,
          prelaunch = 0;
        var status = {};
        var status_project = [];
        await asyncForEach(projDocs, async (project) => {
          if (project.project_status == "Ready To Move") {
            readytomove++;
          } else if (project.project_status == "Under Construction") {
            underconstruction++;
          } else if (project.project_status == "Pre Launch") {
            prelaunch++;
          }
        });
        if (prelaunch == 0) {
          prelaunch = null;
        }
        if (underconstruction == 0) {
          underconstruction = null;
        }
        if (readytomove == 0) {
          readytomove = null;
        }
        status = {
          PreLaunch: prelaunch,
          UnderConstruction: underconstruction,
          ReadyToMove: readytomove,
        };
        if (readytomove > 0) {
          status_project.push({ type: "Ready To Move", count: readytomove });
        }

        if (prelaunch > 0) {
          status_project.push({ type: "Pre Launch", count: prelaunch });
        }

        if (underconstruction > 0) {
          status_project.push({
            type: "Under Construction",
            count: underconstruction,
          });
        }

        console.log("status_project", status_project);

        let data = await Authority.findOneAndUpdate(
          {
            _id: authority._id,
          },
          {
            $set: {
              project_status_count: status,
              status_project: status_project,
            },
          },
          { new: true, timestamps: false }
        );

        var clonedObj = { ...data };
        delete clonedObj._doc._id;

        await Elastic.delete_entity({
          match_phrase: { url: clonedObj._doc.url },
        });
        clonedObj._doc.doc_type = "authority";
        clonedObj._doc.unique = 1;
        await Elastic.create_entitiy(clonedObj._doc);
      });
    } catch (error) {
      console.log("[Error updating propertycount in State]", error);
    }
  },

  /* UPDATE PROPERTY TYPE IN BUILDER E.G. RESIDENTIAL/COMMERCIAL ETC. */
  updatePropertyTypeInBuilder: async function () {
    try {
      let builderDocs = await Builder.find({});
      await asyncForEach(builderDocs, async (builder) => {
        let projDocs = await Project.find({
          builder: builder.name,
          is_live: "2",
        });

        var apartments = 0,
          villas = 0,
          floors = 0,
          residentialPlots = 0,
          penthouse = 0,
          duplex = 0,
          commercialOfficeSpaces = 0,
          retailShop = 0,
          commercialLand = 0,
          servicedApartments = 0,
          industrialLand = 0,
          farmhouse = 0;

        var builder_property_type = [];
        await asyncForEach(projDocs, async (project) => {
          if (project.property_type == "Apartments") {
            apartments++;
          } else if (project.property_type == "Residential Plots") {
            residentialPlots++;
          } else if (project.property_type == "Villas") {
            villas++;
          } else if (project.property_type == "Floors") {
            floors++;
          } else if (project.property_type == "Penthouse") {
            penthouse++;
          } else if (project.property_type == "Duplex") {
            duplex++;
          } else if (project.property_type == "Commercial Office") {
            commercialOfficeSpaces++;
          } else if (project.property_type == "Retail Shop") {
            retailShop++;
          } else if (project.property_type == "Commercial Land") {
            commercialLand++;
          } else if (project.property_type == "Serviced Apartments") {
            servicedApartments++;
          } else if (project.property_type == "Industrial Land") {
            industrialLand++;
          } else if (project.property_type == "Farm house") {
            farmhouse++;
          }
        });

        if (apartments > 0) {
          builder_property_type.push("Apartments");
        }

        if (residentialPlots > 0) {
          builder_property_type.push("Residential Plots");
        }

        if (villas > 0) {
          builder_property_type.push("Villas");
        }

        if (floors > 0) {
          builder_property_type.push("Floors");
        }

        if (penthouse > 0) {
          builder_property_type.push("Penthouse");
        }

        if (duplex > 0) {
          builder_property_type.push("Duplex");
        }

        if (commercialOfficeSpaces > 0) {
          builder_property_type.push("Commercial Office");
        }

        if (retailShop > 0) {
          builder_property_type.push("Retail Shop");
        }

        if (commercialLand > 0) {
          builder_property_type.push("Commercial Land");
        }

        if (servicedApartments > 0) {
          builder_property_type.push("Serviced Apartments");
        }

        if (industrialLand > 0) {
          builder_property_type.push("Industrial Land");
        }

        if (farmhouse > 0) {
          builder_property_type.push("Farm house");
        }

        let data = await Builder.findOneAndUpdate(
          {
            _id: builder._id,
          },
          {
            $set: {
              builder_property_type: builder_property_type,
            },
          },
          { new: true, timestamps: false }
        );

        var clonedObj = { ...data };
        delete clonedObj._doc._id;

        await Elastic.delete_entity({
          match_phrase: { url: clonedObj._doc.url },
        });
        clonedObj._doc.doc_type = "builder";
        clonedObj._doc.unique = 1;
        await Elastic.create_entitiy(clonedObj._doc);
      });
    } catch (error) {
      console.log("[Error updating propertycount in State]", error);
    }
  },
  /* UPDATE PRICE IN PROJECTS */
  updatePriceInProjects: async function () {
    // var count = 0;

    // await Project.find({}).then(async (projDocs) => {
    //     for (let i = 0; i < projDocs.length; i++) { //PICK ONE PROJECT
    //         var project = projDocs[i].name;
    //         await Property.find({ 'project': project, "is_live": "2" }).then(async (propDocs) => { // COUNT ALL THE PROJECTS HAVING THIS BUILDER
    //             var priceArr = []

    //             for (var j = 0; j < propDocs.length; j++) {
    //                 if (propDocs[j].price && propDocs[j].price.price) {
    //                     priceArr.push(propDocs[j].price.price)
    //                 }
    //             }
    //             priceArr.sort(function (a, b) { return a - b });
    //             var price = {
    //                 min: null,
    //                 max: null
    //             }

    //             if (priceArr.length > 0) {
    //                 price = {
    //                     min: priceArr[0],
    //                     max: priceArr[priceArr.length - 1]
    //                 }
    //             }
    //             await Project.findOneAndUpdate({ //PICK EACH PROJECT AND UPDATE ITS PRICE OBJECT
    //                 _id: projDocs[i]._id
    //             }, {
    //                 $set: {
    //                     price: price
    //                 }
    //             }, { "new": true }).then(async (data) => {
    //                 // console.log('***PRICE IN PROJECTS UPDATED***');

    //                 var clonedObj = { ...data };
    //                 delete clonedObj._doc._id
    //                 await Elastic.delete_entity({ match_phrase: { url: clonedObj._doc.url } }).then(async (resp) => {
    //                     clonedObj._doc.doc_type = "project"
    //                     clonedObj._doc.unique = 1;
    //                     await Elastic.create_entitiy(clonedObj._doc).then(async (resp) => {
    //                         // console.log('create resp**********************************', resp)
    //                     }, async (err) => {
    //                         console.log('error white creating', err)
    //                     })
    //                 }, async (error) => {
    //                     console.log('error white deleting', error)
    //                 });
    //                 count++;
    //                 console.log('count is', count);

    //             }, (updateErr) => console.log("updateErr", updateErr));

    //         })
    //     }
    // })

    try {
      let projDocs = await Project.find({ is_live: "2" });
      await asyncForEach(projDocs, async (project) => {
        console.log("Start Updating Project", project.name);
        let propDocs = await Property.find({
          project: project.name,
          is_live: "2",
        });
        console.log(propDocs);
        var priceArr = [];

        for (var j = 0; j < propDocs.length; j++) {
          if (propDocs[j].price && propDocs[j].price.price) {
            priceArr.push(propDocs[j].price.price);
          }
        }
        priceArr.sort(function (a, b) {
          return a - b;
        });

        var price = {
          min: null,
          max: null,
        };

        let zeroTo25Lacs = [];
        let twentyfiveTo50Lacs = [];
        let fiftyTo1cr = [];
        let oneTo5cr = [];
        let fiveToabove = [];

        if (priceArr.length > 0) {
          priceArr.forEach((ele) => {
            console.log(ele);
            if (ele >= 0 && ele <= 2500000) {
              zeroTo25Lacs.push(ele);
            }
            if (ele >= 2500000 && ele <= 5000000) {
              twentyfiveTo50Lacs.push(ele);
            }
            if (ele >= 5000000 && ele <= 10000000) {
              fiftyTo1cr.push(ele);
            }
            if (ele >= 10000000 && ele <= 50000000) {
              oneTo5cr.push(ele);
            }
            if (ele >= 50000000) {
              fiveToabove.push(ele);
            }
          });

          // console.log("zeroTo25Lacs", zeroTo25Lacs)
          // console.log("zeroTo25Lacs", twentyfiveTo50Lacs)
          // console.log("fiftyTo1cr", fiftyTo1cr)

          price = {
            zeroTo25Lacs: zeroTo25Lacs && zeroTo25Lacs.length > 0 ? 1 : 0,
            twentyfiveTo50Lacs:
              twentyfiveTo50Lacs && twentyfiveTo50Lacs.length > 0 ? 1 : 0,
            fiftyTo1cr: fiftyTo1cr && fiftyTo1cr.length > 0 ? 1 : 0,
            oneTo5cr: oneTo5cr && oneTo5cr.length > 0 ? 1 : 0,
            fiveToabove: fiveToabove && fiveToabove.length > 0 ? 1 : 0,
            min: priceArr[0],
            max: priceArr[priceArr.length - 1],
          };
        } else {
          price = {
            zeroTo25Lacs: 0,
            twentyfiveTo50Lacs: 0,
            fiftyTo1cr: 0,
            oneTo5cr: 0,
            fiveToabove: 0,
            min: null,
            max: null,
          };
        }
        //console.log("Object to set", price)

        let data = await Project.findOneAndUpdate(
          {
            //PICK EACH PROJECT AND UPDATE ITS PRICE OBJECT
            _id: project._id,
          },
          {
            $set: {
              price: price,
            },
          },
          { new: true, timestamps: false }
        );

        var clonedObj = { ...data };
        delete clonedObj._doc._id;
        await Elastic.delete_entity_promise({
          match_phrase: { url: clonedObj._doc.url },
        });

        clonedObj._doc.doc_type = "project";
        clonedObj._doc.unique = 1;
        await Elastic.create_entitiy_promise(clonedObj._doc);

        console.log("updated Project", project.name);
      });
      //console.log('***PRICE IN Project UPDATION DONE***');
    } catch (error) {
      console.log(
        "[Error: Got error while updating price on Builders]",
        error.response
      );
    }
    console.log("***PRICE IN PROJECTS UPDATION DONE***");
  },
  /* UPDATE PRICE IN AUTHORITIES */
  updatePriceInBuilders: async function () {
    // await Builder.find({}).limit(1).then(async (builderDocs) => {
    //     for (let i = 0; i < builderDocs.length; i++) { //PICK ONE BUILDER
    //         var builder = builderDocs[i].name;
    //         await Property.find({ 'builder': builder, "is_live": "2" }).then(async (propDocs) => { // COUNT ALL THE PROJECTS HAVING THIS BUILDER
    //             var priceArr = []

    //             for (var j = 0; j < propDocs.length; j++) {
    //                 if (propDocs[j].price && propDocs[j].price.price) {
    //                     priceArr.push(propDocs[j].price.price)
    //                 }
    //             }
    //             priceArr.sort(function (a, b) { return a - b });
    //             var price = {
    //                 min: null,
    //                 max: null
    //             }

    //             if (priceArr.length > 0) {
    //                 price = {
    //                     min: priceArr[0],
    //                     max: priceArr[priceArr.length - 1]
    //                 }
    //             }
    //             await Builder.findOneAndUpdate({ //PICK EACH BUILDER AND UPDATE ITS PRICE OBJECT
    //                 _id: builderDocs[i]._id
    //             }, {
    //                 $set: {
    //                     price: price
    //                 }
    //             }, { "new": true }).then(async (data) => {
    //                 var clonedObj = { ...data };
    //                 console.log("clonedObj", clonedObj)
    //                 delete clonedObj._doc._id
    //                 await Elastic.delete_entity({ match_phrase: { url: clonedObj._doc.url } }).then(async (resp) => {
    //                     clonedObj._doc.doc_type = "builder"
    //                     clonedObj._doc.unique = 1;
    //                     await Elastic.create_entitiy(clonedObj._doc).then(async (resp) => {
    //                         // console.log('create resp**********************************', resp)
    //                     }, async (err) => {
    //                         console.log('error white creating', err)
    //                     })
    //                 }, async (error) => {
    //                     console.log('error white deleting', error)
    //                 });

    //                 console.log('***PRICE IN PROJECTS UPDATED***');
    //             }, (updateErr) => console.log("updateErr", updateErr));

    //         })
    //     }
    // })

    try {
      let builderDocs = await Builder.find({});
      await asyncForEach(builderDocs, async (builder) => {
        console.log("Start Updating Builder", builder.name);
        let propDocs = await Property.find({
          builder: builder.name,
          is_live: "2",
        });
        var priceArr = [];

        for (var j = 0; j < propDocs.length; j++) {
          if (propDocs[j].price && propDocs[j].price.price) {
            priceArr.push(propDocs[j].price.price);
          }
        }
        priceArr.sort(function (a, b) {
          return a - b;
        });
        var price = {
          min: null,
          max: null,
        };

        if (priceArr.length > 0) {
          price = {
            min: priceArr[0],
            max: priceArr[priceArr.length - 1],
          };
        }
        console.log("Object to set", price);

        //PICK EACH BUILDER AND UPDATE ITS PRICE OBJECT
        let data = await Builder.findOneAndUpdate(
          {
            //PICK EACH BUILDER AND UPDATE ITS PRICE OBJECT
            _id: builder._id,
          },
          {
            $set: {
              price: price,
            },
          },
          { new: true, timestamps: false }
        );

        var clonedObj = { ...data };
        delete clonedObj._doc._id;
        await Elastic.delete_entity_promise({
          match_phrase: { url: clonedObj._doc.url },
        });

        clonedObj._doc.doc_type = "builder";
        clonedObj._doc.unique = 1;
        await Elastic.create_entitiy_promise(clonedObj._doc);

        console.log("updated builder", builder.name);
      });
      console.log("***PRICE IN BUILDER UPDATION DONE***");
    } catch (error) {
      console.log(
        "[Error: Got error while updating price on Builders]",
        error.response
      );
    }
  },
  /* UPDATE PRICE IN AUTHORITIES */
  updatePriceInAuthorities: async function () {
    // await Authority.find({}).then(async (authjDocs) => {
    //     for (let i = 0; i < authjDocs.length; i++) { //PICK ONE PROJECT
    //         var authority = authjDocs[i].name;
    //         await Property.find({ 'authority': authority, "is_live": "2" }).then(async (propDocs) => { // COUNT ALL THE PROJECTS HAVING THIS BUILDER
    //             var priceArr = []

    //             for (var j = 0; j < propDocs.length; j++) {
    //                 if (propDocs[j].price && propDocs[j].price.price) {
    //                     priceArr.push(propDocs[j].price.price)
    //                 }
    //             }
    //             priceArr.sort(function (a, b) { return a - b });
    //             var price = {
    //                 min: null,
    //                 max: null
    //             }
    //             if (priceArr.length > 0) {
    //                 price = {
    //                     min: priceArr[0],
    //                     max: priceArr[priceArr.length - 1]
    //                 }
    //             }
    //             await Authority.findOneAndUpdate({ //PICK EACH AUTHORITY AND UPDATE ITS PRICE OBJECT
    //                 _id: authjDocs[i]._id
    //             }, {
    //                 $set: {
    //                     price: price
    //                 }
    //             }, { "new": true }).then(async (data) => {

    //                 var clonedObj = { ...data };
    //                 delete clonedObj._doc._id
    //                 await Elastic.delete_entity({ match_phrase: { url: clonedObj._doc.url } }).then(async (resp) => {
    //                     clonedObj._doc.doc_type = "authority"
    //                     clonedObj._doc.unique = 1;
    //                     await Elastic.create_entitiy(clonedObj._doc).then(async (resp) => {
    //                         // console.log('create resp**********************************', resp)
    //                     }, async (err) => {
    //                         console.log('error white creating', err)
    //                     })
    //                 }, async (error) => {
    //                     console.log('error white deleting', error)
    //                 });

    //                 // console.log('***PRICE IN PROJECTS UPDATED***');
    //             }, (updateErr) => console.log("updateErr", updateErr));
    //         })
    //     }
    // })

    try {
      let authjDocs = await Authority.find({});
      await asyncForEach(authjDocs, async (authority) => {
        console.log("Start updating authority ", authority.name);
        let propDocs = await Property.find({
          authority: authority.name,
          is_live: "2",
        });

        var priceArr = [];

        for (var j = 0; j < propDocs.length; j++) {
          if (propDocs[j].price && propDocs[j].price.price) {
            priceArr.push(propDocs[j].price.price);
          }
        }
        priceArr.sort(function (a, b) {
          return a - b;
        });
        var price = {
          min: null,
          max: null,
        };
        if (priceArr.length > 0) {
          price = {
            min: priceArr[0],
            max: priceArr[priceArr.length - 1],
          };
        }

        console.log("price", price);

        let data = await Authority.findOneAndUpdate(
          {
            //PICK EACH AUTHORITY AND UPDATE ITS PRICE OBJECT
            _id: authority._id,
          },
          {
            $set: {
              price: price,
            },
          },
          { new: true, timestamps: false }
        );

        var clonedObj = { ...data };
        delete clonedObj._doc._id;

        await Elastic.delete_entity_promise({
          match_phrase: { url: clonedObj._doc.url },
        });
        clonedObj._doc.doc_type = "authority";
        clonedObj._doc.unique = 1;
        await Elastic.create_entitiy_promise(clonedObj._doc);
        console.log("Update authority successfully", authority.name);
      });
    } catch (error) {
      console.log("[Error updating price in Authority]", error);
    }

    console.log("***PRICE IN AUTHORITY UPDATION DONE***");
  },
  propertyTypesInAuthorities: async function () {
    // await Authority.find({}).then(async (authDocs) => { // GET ALL AUTHORITIES
    //     for (let i = 0; i < authDocs.length; i++) { //PICK ONE BUILDER
    //         var authority = authDocs[i].name;
    //         await Project.find({ 'authority': authority, "is_live": "2" }).then(async (projDocs) => { // COUNT ALL THE PROJECTS HAVING THIS BUILDER
    //             var readytomove = 0, underconstruction = 0, prelaunch = 0;
    //             var status = {};
    //             for (var j = 0; j < projDocs.length; j++) {
    //                 // console.log('project status is :', )
    //                 if (projDocs[j].project_status == "Ready To Move") {
    //                     readytomove++;
    //                 } else if (projDocs[j].project_status == "Under Construction") {
    //                     underconstruction++;
    //                 } else if (projDocs[j].project_status == "Pre Launch") {
    //                     prelaunch++;
    //                 }
    //             }
    //             if (prelaunch == 0) { prelaunch = null }
    //             if (underconstruction == 0) { underconstruction = null }
    //             if (readytomove == 0) { readytomove = null }
    //             status = {
    //                 PreLaunch: prelaunch,
    //                 UnderConstruction: underconstruction,
    //                 ReadyToMove: readytomove
    //             }
    //             await Authority.findOneAndUpdate({ //PICK EACH BUILDER AND UPDATE ITS STATUS_PROJECT ARRAY
    //                 _id: authDocs[i]._id
    //             }, {
    //                 $set: {
    //                     project_status_count: status
    //                 }
    //             }, { "new": true }).then(async (data) => {

    //                 var clonedObj = { ...data };
    //                 delete clonedObj._doc._id
    //                 await Elastic.delete_entity({ match_phrase: { url: clonedObj._doc.url } }).then(async (resp) => {
    //                     clonedObj._doc.doc_type = "authority"
    //                     clonedObj._doc.unique = 1;
    //                     await Elastic.create_entitiy(clonedObj._doc).then(async (resp) => {
    //                         // console.log('create resp**********************************', resp)
    //                     }, async (err) => {
    //                         console.log('error white creating', err)
    //                     })
    //                 }, async (error) => {
    //                     console.log('error white deleting', error)
    //                 });

    //                 // console.log('***Project Status updated In Authority UPDATED***');
    //             }, (updateErr) => console.log("updateErr", updateErr));

    //         }, (projDocsErr) => console.log('projDocsErr', projDocsErr))
    //     }
    // }, (authDocsErr) => console.log('authDocsErr', authDocsErr))
    // console.log('*****UPDATION DONE*****')
    try {
      let authjDocs = await Authority.find({});
      await asyncForEach(authjDocs, async (authority) => {
        console.log("Start updating authority ", authority.name);
        let propDocs = await Property.find({
          authority: authority.name,
          is_live: "2",
        });

        var readytomove = 0,
          underconstruction = 0,
          prelaunch = 0;
        var status = {};
        for (var j = 0; j < propDocs.length; j++) {
          // console.log('project status is :', )
          if (propDocs[j].project_status == "Ready To Move") {
            readytomove++;
          } else if (propDocs[j].project_status == "Under Construction") {
            underconstruction++;
          } else if (propDocs[j].project_status == "Pre Launch") {
            prelaunch++;
          }
        }
        if (prelaunch == 0) {
          prelaunch = null;
        }
        if (underconstruction == 0) {
          underconstruction = null;
        }
        if (readytomove == 0) {
          readytomove = null;
        }
        status = {
          PreLaunch: prelaunch,
          UnderConstruction: underconstruction,
          ReadyToMove: readytomove,
        };

        let data = await Authority.findOneAndUpdate(
          {
            //PICK EACH AUTHORITY AND UPDATE ITS PROPERTY OBJECT
            _id: authority._id,
          },
          {
            $set: {
              project_status_count: status,
            },
          },
          { new: true, timestamps: false }
        );

        var clonedObj = { ...data };
        delete clonedObj._doc._id;

        await Elastic.delete_entity_promise({
          match_phrase: { url: clonedObj._doc.url },
        });
        clonedObj._doc.doc_type = "authority";
        clonedObj._doc.unique = 1;
        await Elastic.create_entitiy_promise(clonedObj._doc);
        console.log("Update authority successfully", authority.name);
      });
    } catch (error) {
      console.log("[Error updating property in Authority]", error);
    }

    console.log("***PROPERTY IN AUTHORITY UPDATION DONE***");
  },
  updateDataInTags: async function () {
    var allTagNames = [];
    console.log("-------------------TAG NAMES CRON--------------");
    await Project.find({}).then(async (propDocs) => {
      console.log("getting Projects");
      for (let a = 1; a < propDocs.length; a++) {
        allTagNames.push(propDocs[a].name.trim());
      }
      await Authority.find({}).then(async (authDocs) => {
        console.log("getting authorities");
        for (let b = 1; b < authDocs.length; b++) {
          allTagNames.push(authDocs[b].name.trim());
        }
        await Bank.find({}).then(async (bankDocs) => {
          console.log("getting Banks");
          for (let c = 1; c < bankDocs.length; c++) {
            allTagNames.push(bankDocs[c].name.trim());
          }
          await Builder.find({}).then(async (builderDocs) => {
            console.log("getting Builders");
            for (let d = 1; d < builderDocs.length; d++) {
              allTagNames.push(builderDocs[d].name.trim());
            }
            await City.find({}).then(async (cityDocs) => {
              console.log("getting Cities");
              for (let e = 1; e < cityDocs.length; e++) {
                allTagNames.push(cityDocs[e].name.trim());
              }
              await Subcity.find({}).then(async (subcityDocs) => {
                console.log("getting Subcities");
                for (let f = 1; f < subcityDocs.length; f++) {
                  allTagNames.push(subcityDocs[f].name.trim());
                }
                await State.find({}).then(async (stateDocs) => {
                  console.log("getting States");
                  for (let g = 1; g < stateDocs.length; g++) {
                    allTagNames.push(stateDocs[g].name.trim());
                  }
                  await District.find({}).then(async (distDocs) => {
                    console.log("getting District");
                    for (let h = 1; h < distDocs.length; h++) {
                      allTagNames.push(distDocs[h].name.trim());
                    }

                    console.log(" all tag names length", allTagNames.length);

                    for (let i = 0; i < allTagNames.length; i++) {
                      await Tag.findOneAndUpdate(
                        {},
                        {
                          $addToSet: { tags: allTagNames[i] },
                        },
                        { new: true, timestamps: false }
                      ).then(
                        async (tagDoc) => {
                          console.log("data updata in tag", i);
                        },
                        async (e) => {
                          console.log("Err while updating tag names", e);
                        }
                      );
                    }
                  });
                });
              });
            });
          });
        });
      });
    });
  },
  // _______________________________________________________
  updateTotalProjectsInState: async function () {
    await State.find({}).then(
      async (stateDocs) => {
        // GET ALL STATE
        for (let i = 0; i < stateDocs.length; i++) {
          //PICK ONE STATE
          var state = stateDocs[i].name;
          await Project.find({ state: state, is_live: "2" }).then(
            async (projDocs) => {
              // COUNT ALL THE PROJECTS HAVING THIS STATE
              // projDocs.length
              var TotProjects = projDocs.length;
              if (TotProjects == 0) {
                TotProjects = null;
              }
              console.log("projDocs.length : ", state, projDocs.length);
              await State.findOneAndUpdate(
                {
                  //PICK EACH STATE AND UPDATE ITS TOTAL_PROJECTS COUNT
                  _id: stateDocs[i]._id,
                },
                {
                  $set: {
                    total_projects: TotProjects,
                  },
                },
                { new: true, timestamps: false }
              ).then(
                async (data) => {
                  var clonedObj = { ...data };
                  clonedObj._doc.location_details = clonedObj._doc.details;
                  delete clonedObj._doc._id;
                  delete clonedObj._doc.details;
                  clonedObj._doc["location_type"] = "state";
                  await Elastic.delete_entity({
                    match_phrase: { url: clonedObj._doc.url },
                  }).then(
                    async (resp) => {
                      clonedObj._doc.doc_type = "location";
                      clonedObj._doc.unique = 1;
                      await Elastic.create_entitiy(clonedObj._doc).then(
                        async (resp) => { },
                        async (err) => {
                          console.log("error white creating", err);
                        }
                      );
                    },
                    async (error) => {
                      console.log("error white deleting", error);
                    }
                  );
                },
                (updateErr) => console.log("updateErr", updateErr)
              );
            },
            (projDocsErr) => console.log("projDocsErr", projDocsErr)
          );
        }
      },
      (builderDocsErr) => console.log("builderDocsErr", builderDocsErr)
    );
    console.log("updation done-------------");
  },
  updateTotalPropertiesInState: async function () {
    // await State.find({}).then(async (stateDocs) => { // GET ALL STATE
    //   for (let i = 0; i < stateDocs.length; i++) { //PICK ONE STATE
    //     var state = stateDocs[i].name;
    //     await Property.find({ 'state': state, "is_live": "2" }).then(async (projDocs) => { // COUNT ALL THE PROJECTS HAVING THIS STATE
    //       // projDocs.length
    //       var TotProjects = projDocs.length
    //       if (TotProjects == 0) {
    //         TotProjects = null
    //       }
    //       console.log('projDocs.length : ', state, projDocs.length)
    //       await State.findOneAndUpdate({ //PICK EACH STATE AND UPDATE ITS TOTAL_PROJECTS COUNT
    //         _id: stateDocs[i]._id
    //       }, {
    //         $set: {
    //           total_properties: TotProjects
    //         }
    //       }, { "new": true }).then(async (data) => {
    //         var clonedObj = { ...data };
    //         clonedObj._doc.location_details = clonedObj._doc.details
    //         delete clonedObj._doc._id
    //         delete clonedObj._doc.details
    //         clonedObj._doc["location_type"] = "state"
    //         await Elastic.delete_entity({ match_phrase: { url: clonedObj._doc.url } }).then(async (resp) => {
    //           clonedObj._doc.doc_type = "location"
    //           clonedObj._doc.unique = 1;
    //           await Elastic.create_entitiy(clonedObj._doc).then(async (resp) => {
    //           }, async (err) => {
    //             console.log('error white creating', err)
    //           })
    //         }, async (error) => {
    //           console.log('error white deleting', error)
    //         });

    //       }, (updateErr) => console.log("updateErr", updateErr))

    //     }, (projDocsErr) => console.log('projDocsErr', projDocsErr))
    //   }
    // }, (builderDocsErr) => console.log('builderDocsErr', builderDocsErr))
    // console.log('updation done-------------')

    try {
      let stateDocs = await State.find({});
      await asyncForEach(stateDocs, async (state) => {
        let propDocs = await Property.count({
          state: state.name,
          is_live: "2",
        });

        //JSON.parse(JSON.stringify(propDocs))
        console.log("TotProperties", propDocs);
        if (propDocs == 0) {
          propDocs = null;
        }

        console.log("propDocs", state._id);

        let data = await State.findOneAndUpdate(
          {
            _id: state._id,
          },
          { total_properties: propDocs },
          { new: true, timestamps: false }
        );

        console.log("total_properties", data.total_properties);
        var clonedObj = { ...data };
        clonedObj._doc.location_details = clonedObj._doc.details;
        delete clonedObj._doc._id;
        delete clonedObj._doc.details;
        clonedObj._doc["location_type"] = "state";
        await Elastic.delete_entity_promise({
          match_phrase: { url: clonedObj._doc.url },
        });
        clonedObj._doc.doc_type = "location";
        clonedObj._doc.unique = 1;
        await Elastic.create_entitiy_promise(clonedObj._doc);
      });
    } catch (error) {
      console.log("[Error updating propertycount in State]", error);
    }
  },
  updateTotalPropertiesInProject: async function () {
    try {
      let projectDocs = await Project.find({});
      await asyncForEach(projectDocs, async (state) => {
        // console.log("*&*&  state => ", state);
        let propDocs = await Property.count({
          project: state.name,
          is_live: "2",
        });

        //JSON.parse(JSON.stringify(propDocs))
        console.log("TotalProperties", propDocs);
        if (propDocs === 0) {
          propDocs = 0;
        }

        console.log("propDocs", state._id);

        let data = await Project.findOneAndUpdate(
          {
            _id: state._id,
          },
          { total_properties: propDocs },
          { new: true, timestamps: false }
        );

        console.log("total_properties", data.total_properties);
        var clonedObj = { ...data };
        delete clonedObj._doc._id;
        await Elastic.delete_entity_promise({
          match_phrase: { url: clonedObj._doc.url },
        });
        clonedObj._doc.doc_type = "project";
        clonedObj._doc.unique = 1;
        await Elastic.create_entitiy_promise(clonedObj._doc);
      });
    } catch (error) {
      console.log("[Error in Project update] status:", error.response.status);
      console.log(
        "[Error updating propertycount in Project]",
        error.response
      );
    }
  },

  updateTotalPropertiesInDistrict: async function () {
    // await State.find({}).then(async (stateDocs) => { // GET ALL STATE
    //   for (let i = 0; i < stateDocs.length; i++) { //PICK ONE STATE
    //     var state = stateDocs[i].name;
    //     await Property.find({ 'state': state, "is_live": "2" }).then(async (projDocs) => { // COUNT ALL THE PROJECTS HAVING THIS STATE
    //       // projDocs.length
    //       var TotProjects = projDocs.length
    //       if (TotProjects == 0) {
    //         TotProjects = null
    //       }
    //       console.log('projDocs.length : ', state, projDocs.length)
    //       await State.findOneAndUpdate({ //PICK EACH STATE AND UPDATE ITS TOTAL_PROJECTS COUNT
    //         _id: stateDocs[i]._id
    //       }, {
    //         $set: {
    //           total_properties: TotProjects
    //         }
    //       }, { "new": true }).then(async (data) => {
    //         var clonedObj = { ...data };
    //         clonedObj._doc.location_details = clonedObj._doc.details
    //         delete clonedObj._doc._id
    //         delete clonedObj._doc.details
    //         clonedObj._doc["location_type"] = "state"
    //         await Elastic.delete_entity({ match_phrase: { url: clonedObj._doc.url } }).then(async (resp) => {
    //           clonedObj._doc.doc_type = "location"
    //           clonedObj._doc.unique = 1;
    //           await Elastic.create_entitiy(clonedObj._doc).then(async (resp) => {
    //           }, async (err) => {
    //             console.log('error white creating', err)
    //           })
    //         }, async (error) => {
    //           console.log('error white deleting', error)
    //         });

    //       }, (updateErr) => console.log("updateErr", updateErr))

    //     }, (projDocsErr) => console.log('projDocsErr', projDocsErr))
    //   }
    // }, (builderDocsErr) => console.log('builderDocsErr', builderDocsErr))
    // console.log('updation done-------------')

    try {
      let stateDocs = await District.find({});
      await asyncForEach(stateDocs, async (state) => {
        let propDocs = await Property.find({
          district: state.name,
          is_live: "2",
        });
        var TotProperties = propDocs.length;
        console.log("TotProperties", TotProperties);
        if (TotProperties == 0) {
          TotProperties = null;
        }

        let data = await District.findOneAndUpdate(
          {
            //PICK EACH AUTHORITY AND UPDATE ITS PROPERTY OBJECT
            _id: state._id,
          },
          {
            $set: {
              total_properties: TotProperties,
            },
          },
          { new: true, timestamps: false }
        );

        var clonedObj = { ...data };
        clonedObj._doc.location_details = clonedObj._doc.details;
        delete clonedObj._doc._id;
        delete clonedObj._doc.details;
        clonedObj._doc["location_type"] = "district";

        await Elastic.delete_entity_promise({
          match_phrase: { url: clonedObj._doc.url },
        });
        clonedObj._doc.doc_type = "location";
        clonedObj._doc.unique = 1;
        await Elastic.create_entitiy_promise(clonedObj._doc);
      });
    } catch (error) {
      console.log("[Error updating propertycount in State]", error);
    }
  },
  updateTotalProjectsInDistrict: async function () {
    await District.find({}).then(
      async (distDocs) => {
        // GET ALL DISTRICT
        for (let i = 0; i < distDocs.length; i++) {
          //PICK ONE DISTRICT
          var district = distDocs[i].name;
          await Project.find({ district: district, is_live: "2" }).then(
            async (projDocs) => {
              // COUNT ALL THE PROJECTS HAVING THIS DISTRICT
              // projDocs.length
              var TotProjects = projDocs.length;
              if (TotProjects == 0) {
                TotProjects = null;
              }
              console.log("projDocs.length : ", district, projDocs.length);
              await District.findOneAndUpdate(
                {
                  //PICK EACH DISTRICT AND UPDATE ITS TOTAL_PROJECTS COUNT
                  _id: distDocs[i]._id,
                },
                {
                  $set: {
                    total_projects: TotProjects,
                  },
                },
                { new: true, timestamps: false }
              ).then(
                async (data) => {
                  var clonedObj = { ...data };
                  clonedObj._doc.location_details = clonedObj._doc.details;
                  delete clonedObj._doc._id;
                  delete clonedObj._doc.details;
                  clonedObj._doc["location_type"] = "district";

                  await Elastic.delete_entity({
                    match_phrase: { url: clonedObj._doc.url },
                  }).then(
                    async (resp) => {
                      clonedObj._doc.doc_type = "location";
                      clonedObj._doc.unique = 1;
                      await Elastic.create_entitiy(clonedObj._doc).then(
                        async (resp) => { },
                        async (err) => {
                          console.log("error white creating", err);
                        }
                      );
                    },
                    async (error) => {
                      console.log("error white deleting", error);
                    }
                  );
                },
                (updateErr) => console.log("updateErr", updateErr)
              );
            },
            (projDocsErr) => console.log("projDocsErr", projDocsErr)
          );
        }
      },
      (builderDocsErr) => console.log("builderDocsErr", builderDocsErr)
    );
    console.log("updation done for total properties in projects-------------");
  },

  updateTotalPropertiesInCity: async function () {
    // await State.find({}).then(async (stateDocs) => { // GET ALL STATE
    //   for (let i = 0; i < stateDocs.length; i++) { //PICK ONE STATE
    //     var state = stateDocs[i].name;
    //     await Property.find({ 'state': state, "is_live": "2" }).then(async (projDocs) => { // COUNT ALL THE PROJECTS HAVING THIS STATE
    //       // projDocs.length
    //       var TotProjects = projDocs.length
    //       if (TotProjects == 0) {
    //         TotProjects = null
    //       }
    //       console.log('projDocs.length : ', state, projDocs.length)
    //       await State.findOneAndUpdate({ //PICK EACH STATE AND UPDATE ITS TOTAL_PROJECTS COUNT
    //         _id: stateDocs[i]._id
    //       }, {
    //         $set: {
    //           total_properties: TotProjects
    //         }
    //       }, { "new": true }).then(async (data) => {
    //         var clonedObj = { ...data };
    //         clonedObj._doc.location_details = clonedObj._doc.details
    //         delete clonedObj._doc._id
    //         delete clonedObj._doc.details
    //         clonedObj._doc["location_type"] = "state"
    //         await Elastic.delete_entity({ match_phrase: { url: clonedObj._doc.url } }).then(async (resp) => {
    //           clonedObj._doc.doc_type = "location"
    //           clonedObj._doc.unique = 1;
    //           await Elastic.create_entitiy(clonedObj._doc).then(async (resp) => {
    //           }, async (err) => {
    //             console.log('error white creating', err)
    //           })
    //         }, async (error) => {
    //           console.log('error white deleting', error)
    //         });

    //       }, (updateErr) => console.log("updateErr", updateErr))

    //     }, (projDocsErr) => console.log('projDocsErr', projDocsErr))
    //   }
    // }, (builderDocsErr) => console.log('builderDocsErr', builderDocsErr))
    // console.log('updation done-------------')

    try {
      let stateDocs = await City.find({});
      await asyncForEach(stateDocs, async (state) => {
        let propDocs = await Property.find({ city: state.name, is_live: "2" });
        var TotProperties = propDocs.length;
        if (TotProperties == 0) {
          TotProperties = null;
        }

        let data = await City.findOneAndUpdate(
          {
            //PICK EACH AUTHORITY AND UPDATE ITS PROPERTY OBJECT
            _id: state._id,
          },
          {
            $set: {
              total_properties: TotProperties,
            },
          },
          { new: true, timestamps: false }
        );

        var clonedObj = { ...data };
        clonedObj._doc.location_details = clonedObj._doc.details;
        delete clonedObj._doc._id;
        delete clonedObj._doc.details;
        clonedObj._doc["location_type"] = "city";

        await Elastic.delete_entity_promise({
          match_phrase: { url: clonedObj._doc.url },
        });
        clonedObj._doc.doc_type = "location";
        clonedObj._doc.unique = 1;
        await Elastic.create_entitiy_promise(clonedObj._doc);
      });
    } catch (error) {
      console.log("[Error updating propertycount in State]", error);
    }
  },
  updateTotalProjectsInCity: async function () {
    await City.find({}).then(
      async (cityDocs) => {
        // GET ALL CITY
        for (let i = 0; i < cityDocs.length; i++) {
          //PICK ONE CITY
          var city = cityDocs[i].name;
          await Project.find({ city: city, is_live: "2" }).then(
            async (projDocs) => {
              // COUNT ALL THE PROJECTS HAVING THIS CITY
              // projDocs.length
              var TotProjects = projDocs.length;
              if (TotProjects == 0) {
                TotProjects = null;
              }
              console.log("projDocs.length : ", city, projDocs.length);
              await City.findOneAndUpdate(
                {
                  //PICK EACH CITY AND UPDATE ITS TOTAL_PROJECTS COUNT
                  _id: cityDocs[i]._id,
                },
                {
                  $set: {
                    total_projects: TotProjects,
                  },
                },
                { new: true, timestamps: false }
              ).then(
                async (data) => {
                  var clonedObj = { ...data };
                  clonedObj._doc.location_details = clonedObj._doc.details;
                  delete clonedObj._doc._id;
                  delete clonedObj._doc.details;
                  clonedObj._doc["location_type"] = "city";
                  await Elastic.delete_entity({
                    match_phrase: { url: clonedObj._doc.url },
                  }).then(
                    async (resp) => {
                      clonedObj._doc.doc_type = "location";
                      clonedObj._doc.unique = 1;
                      await Elastic.create_entitiy(clonedObj._doc).then(
                        async (resp) => { },
                        async (err) => {
                          console.log("error white creating", err);
                        }
                      );
                    },
                    async (error) => {
                      console.log("error white deleting", error);
                    }
                  );
                },
                (updateErr) => console.log("updateErr", updateErr)
              );
            },
            (projDocsErr) => console.log("projDocsErr", projDocsErr)
          );
        }
      },
      (builderDocsErr) => console.log("builderDocsErr", builderDocsErr)
    );
    console.log("updation done-------------");
  },

  updateTotalPropertiesInSubCity: async function () {
    // await State.find({}).then(async (stateDocs) => { // GET ALL STATE
    //   for (let i = 0; i < stateDocs.length; i++) { //PICK ONE STATE
    //     var state = stateDocs[i].name;
    //     await Property.find({ 'state': state, "is_live": "2" }).then(async (projDocs) => { // COUNT ALL THE PROJECTS HAVING THIS STATE
    //       // projDocs.length
    //       var TotProjects = projDocs.length
    //       if (TotProjects == 0) {
    //         TotProjects = null
    //       }
    //       console.log('projDocs.length : ', state, projDocs.length)
    //       await State.findOneAndUpdate({ //PICK EACH STATE AND UPDATE ITS TOTAL_PROJECTS COUNT
    //         _id: stateDocs[i]._id
    //       }, {
    //         $set: {
    //           total_properties: TotProjects
    //         }
    //       }, { "new": true }).then(async (data) => {
    //         var clonedObj = { ...data };
    //         clonedObj._doc.location_details = clonedObj._doc.details
    //         delete clonedObj._doc._id
    //         delete clonedObj._doc.details
    //         clonedObj._doc["location_type"] = "state"
    //         await Elastic.delete_entity({ match_phrase: { url: clonedObj._doc.url } }).then(async (resp) => {
    //           clonedObj._doc.doc_type = "location"
    //           clonedObj._doc.unique = 1;
    //           await Elastic.create_entitiy(clonedObj._doc).then(async (resp) => {
    //           }, async (err) => {
    //             console.log('error white creating', err)
    //           })
    //         }, async (error) => {
    //           console.log('error white deleting', error)
    //         });

    //       }, (updateErr) => console.log("updateErr", updateErr))

    //     }, (projDocsErr) => console.log('projDocsErr', projDocsErr))
    //   }
    // }, (builderDocsErr) => console.log('builderDocsErr', builderDocsErr))
    // console.log('updation done-------------')

    try {
      let stateDocs = await Subcity.find({});
      await asyncForEach(stateDocs, async (state) => {
        let propDocs = await Property.find({
          subcity: state.name,
          is_live: "2",
        });
        var TotProperties = propDocs.length;
        if (TotProperties == 0) {
          TotProperties = null;
        }

        let data = await Subcity.findOneAndUpdate(
          {
            _id: state._id,
          },
          {
            $set: {
              total_properties: TotProperties,
            },
          },
          { new: true, timestamps: false }
        );

        var clonedObj = { ...data };
        clonedObj._doc.location_details = clonedObj._doc.details;
        delete clonedObj._doc._id;
        delete clonedObj._doc.details;
        clonedObj._doc["location_type"] = "subcity";

        await Elastic.delete_entity_promise({
          match_phrase: { url: clonedObj._doc.url },
        });
        clonedObj._doc.doc_type = "location";
        clonedObj._doc.unique = 1;
        await Elastic.create_entitiy_promise(clonedObj._doc);
      });
    } catch (error) {
      console.log("[Error updating propertycount in State]", error);
    }
  },
  updateTotalProjectsInSubCity: async function () {
    await Subcity.find({}).then(
      async (subCityDocs) => {
        // GET ALL SUBCITY
        for (let i = 0; i < subCityDocs.length; i++) {
          //PICK ONE SUBCITY
          var subcity = subCityDocs[i].name;
          await Project.find({ subcity: subcity, is_live: "2" }).then(
            async (projDocs) => {
              // COUNT ALL THE PROJECTS HAVING THIS SUBCITY
              // projDocs.length
              var TotProjects = projDocs.length;
              if (TotProjects == 0) {
                TotProjects = null;
              }
              console.log("projDocs.length : ", subcity, projDocs.length);
              await Subcity.findOneAndUpdate(
                {
                  //PICK EACH SUBCITY AND UPDATE ITS TOTAL_PROJECTS COUNT
                  _id: subCityDocs[i]._id,
                },
                {
                  $set: {
                    total_projects: TotProjects,
                  },
                },
                { new: true, timestamps: false }
              ).then(
                async (data) => {
                  var clonedObj = { ...data };
                  clonedObj._doc.location_details = clonedObj._doc.details;
                  delete clonedObj._doc._id;
                  delete clonedObj._doc.details;
                  clonedObj._doc["location_type"] = "subcity";
                  await Elastic.delete_entity({
                    match_phrase: { url: clonedObj._doc.url },
                  }).then(
                    async (resp) => {
                      clonedObj._doc.doc_type = "location";
                      clonedObj._doc.unique = 1;
                      await Elastic.create_entitiy(clonedObj._doc).then(
                        async (resp) => { },
                        async (err) => {
                          console.log("error white creating", err);
                        }
                      );
                    },
                    async (error) => {
                      console.log("error white deleting", error);
                    }
                  );
                },
                (updateErr) => console.log("updateErr", updateErr)
              );
            },
            (projDocsErr) => console.log("projDocsErr", projDocsErr)
          );
        }
      },
      (builderDocsErr) => console.log("builderDocsErr", builderDocsErr)
    );
    console.log("updation done-------------");
  },
  // _______________________________________________________
  updatePriceInState: async function () {
    // await State.find({}).then(async (stateDocs) => {
    //     for (let i = 0; i < stateDocs.length; i++) { //PICK ONE STATE
    //         var state = stateDocs[i].name;
    //         await Property.find({ 'state': state, "is_live": "2" }).then(async (propDocs) => { // COUNT ALL THE PROJECTS HAVING THIS BUILDER
    //             var priceArr = []

    //             for (var j = 0; j < propDocs.length; j++) {
    //                 if (propDocs[j].price && propDocs[j].price.price) {
    //                     priceArr.push(propDocs[j].price.price)
    //                 }
    //             }
    //             priceArr.sort(function (a, b) { return a - b });
    //             var price = {
    //                 min: null,
    //                 max: null
    //             }
    //             if (priceArr.length > 0) {
    //                 price = {
    //                     min: priceArr[0],
    //                     max: priceArr[priceArr.length - 1]
    //                 }
    //             }
    //             await State.findOneAndUpdate({ //PICK EACH STATE AND UPDATE ITS PRICE OBJECT
    //                 _id: stateDocs[i]._id
    //             }, {
    //                 $set: {
    //                     price: price
    //                 }
    //             }, { "new": true }).then(async (data) => {
    //                 var clonedObj = { ...data };
    //                 clonedObj._doc.location_details = clonedObj._doc.details
    //                 delete clonedObj._doc._id
    //                 delete clonedObj._doc.details
    //                 clonedObj._doc["location_type"] = "state"
    //                 await Elastic.delete_entity({ match_phrase: { url: clonedObj._doc.url } }).then(async (resp) => {
    //                     clonedObj._doc.doc_type = "location"
    //                     clonedObj._doc.unique = 1;
    //                     await Elastic.create_entitiy(clonedObj._doc).then(async (resp) => {
    //                         // console.log('create resp**********************************', resp)
    //                     }, async (err) => {
    //                         console.log('error white creating', err)
    //                     })
    //                 }, async (error) => {
    //                     console.log('error white deleting', error)
    //                 });

    //             }, (updateErr) => console.log("updateErr", updateErr));

    //         })
    //     }
    // })

    try {
      let stateDocs = await State.find({});
      await asyncForEach(stateDocs, async (state) => {
        console.log("Start updating state ", state.name);
        let propDocs = await Property.find({ state: state.name, is_live: "2" });

        var priceArr = [];

        for (var j = 0; j < propDocs.length; j++) {
          if (propDocs[j].price && propDocs[j].price.price) {
            priceArr.push(propDocs[j].price.price);
          }
        }
        priceArr.sort(function (a, b) {
          return a - b;
        });
        var price = {
          min: null,
          max: null,
        };
        if (priceArr.length > 0) {
          price = {
            min: priceArr[0],
            max: priceArr[priceArr.length - 1],
          };
        }

        console.log("price", price);

        let data = await State.findOneAndUpdate(
          {
            //PICK EACH STATE AND UPDATE ITS PRICE OBJECT
            _id: state._id,
          },
          {
            $set: {
              price: price,
            },
          },
          { new: true, timestamps: false }
        );

        var clonedObj = { ...data };
        clonedObj._doc.location_details = clonedObj._doc.details;
        delete clonedObj._doc._id;
        delete clonedObj._doc.details;
        clonedObj._doc["location_type"] = "state";

        await Elastic.delete_entity_promise({
          match_phrase: { url: clonedObj._doc.url },
        });
        clonedObj._doc.doc_type = "location";
        clonedObj._doc.unique = 1;

        await Elastic.create_entitiy_promise(clonedObj._doc);
        console.log("Update state successfully", state.name);
      });
      console.log("***PRICE IN STATES UPDATION DONE***");
    } catch (error) {
      console.log("[Error updating price in State]", error);
    }
  },
  updatePriceInDistrict: async function () {
    // await District.find({}).then(async (distDocs) => {
    //     for (let i = 0; i < distDocs.length; i++) { //PICK ONE STATE
    //         var district = distDocs[i].name;
    //         await Property.find({ 'district': district, "is_live": "2" }).then(async (propDocs) => { // COUNT ALL THE PROJECTS HAVING THIS BUILDER
    //             var priceArr = []

    //             for (var j = 0; j < propDocs.length; j++) {
    //                 if (propDocs[j].price && propDocs[j].price.price) {
    //                     priceArr.push(propDocs[j].price.price)
    //                 }
    //             }
    //             priceArr.sort(function (a, b) { return a - b });
    //             var price = {
    //                 min: null,
    //                 max: null
    //             }
    //             if (priceArr.length > 0) {
    //                 price = {
    //                     min: priceArr[0],
    //                     max: priceArr[priceArr.length - 1]
    //                 }
    //             }
    //             await District.findOneAndUpdate({ //PICK EACH STATE AND UPDATE ITS PRICE OBJECT
    //                 _id: distDocs[i]._id
    //             }, {
    //                 $set: {
    //                     price: price
    //                 }
    //             }, { "new": true }).then(async (data) => {
    //                 var clonedObj = { ...data };
    //                 clonedObj._doc.location_details = clonedObj._doc.details
    //                 delete clonedObj._doc._id
    //                 delete clonedObj._doc.details
    //                 clonedObj._doc["location_type"] = "district"
    //                 await Elastic.delete_entity({ match_phrase: { url: clonedObj._doc.url } }).then(async (resp) => {
    //                     clonedObj._doc.doc_type = "location"
    //                     clonedObj._doc.unique = 1;
    //                     await Elastic.create_entitiy(clonedObj._doc).then(async (resp) => {
    //                         // console.log('create resp**********************************', resp)
    //                     }, async (err) => {
    //                         console.log('error white creating', err)
    //                     })
    //                 }, async (error) => {
    //                     console.log('error white deleting', error)
    //                 });

    //             }, (updateErr) => console.log("updateErr", updateErr));

    //         })
    //     }
    // })
    try {
      let distDocs = await District.find({});
      await asyncForEach(distDocs, async (district) => {
        console.log("Start updating district", district.name);
        let propDocs = await Property.find({
          district: district.name,
          is_live: "2",
        });
        var priceArr = [];

        for (var j = 0; j < propDocs.length; j++) {
          if (propDocs[j].price && propDocs[j].price.price) {
            priceArr.push(propDocs[j].price.price);
          }
        }
        priceArr.sort(function (a, b) {
          return a - b;
        });
        var price = {
          min: null,
          max: null,
        };
        if (priceArr.length > 0) {
          price = {
            min: priceArr[0],
            max: priceArr[priceArr.length - 1],
          };
        }

        console.log("price", price);
        let data = await District.findOneAndUpdate(
          {
            //PICK EACH STATE AND UPDATE ITS PRICE OBJECT
            _id: district._id,
          },
          {
            $set: {
              price: price,
            },
          },
          { new: true, timestamps: false }
        );

        var clonedObj = { ...data };
        clonedObj._doc.location_details = clonedObj._doc.details;
        delete clonedObj._doc._id;
        delete clonedObj._doc.details;
        clonedObj._doc["location_type"] = "district";
        await Elastic.delete_entity_promise({
          match_phrase: { url: clonedObj._doc.url },
        });

        clonedObj._doc.doc_type = "location";
        clonedObj._doc.unique = 1;
        await Elastic.create_entitiy_promise(clonedObj._doc);
        console.log("Successfully updating district", district.name);
      });
      console.log("***PRICE IN DISTRICTS UPDATION DONE***");
    } catch (error) {
      console.log("[Error updating price in District]", error);
    }
  },
  updatePriceInCity: async function () {
    // await City.find({}).then(async (cityDocs) => {
    //     for (let i = 0; i < cityDocs.length; i++) { //PICK ONE CITY
    //         var city = cityDocs[i].name;
    //         await Property.find({ 'city': city, "is_live": "2" }).then(async (propDocs) => { // COUNT ALL THE PROJECTS HAVING THIS BUILDER
    //             var priceArr = []

    //             for (var j = 0; j < propDocs.length; j++) {
    //                 if (propDocs[j].price && propDocs[j].price.price) {
    //                     priceArr.push(propDocs[j].price.price)
    //                 }
    //             }
    //             priceArr.sort(function (a, b) { return a - b });
    //             var price = {
    //                 min: null,
    //                 max: null
    //             }
    //             if (priceArr.length > 0) {
    //                 price = {
    //                     min: priceArr[0],
    //                     max: priceArr[priceArr.length - 1]
    //                 }
    //             }
    //             await City.findOneAndUpdate({ //PICK EACH CITY AND UPDATE ITS PRICE OBJECT
    //                 _id: cityDocs[i]._id
    //             }, {
    //                 $set: {
    //                     price: price
    //                 }
    //             }, { "new": true }).then(async (data) => {
    //                 var clonedObj = { ...data };
    //                 clonedObj._doc.location_details = clonedObj._doc.details
    //                 delete clonedObj._doc._id
    //                 delete clonedObj._doc.details
    //                 clonedObj._doc["location_type"] = "city"
    //                 await Elastic.delete_entity({ match_phrase: { url: clonedObj._doc.url } }).then(async (resp) => {
    //                     clonedObj._doc.doc_type = "location"
    //                     clonedObj._doc.unique = 1;
    //                     await Elastic.create_entitiy(clonedObj._doc).then(async (resp) => {
    //                         // console.log('create resp**********************************', resp)
    //                     }, async (err) => {
    //                         console.log('error white creating', err)
    //                     })
    //                 }, async (error) => {
    //                     console.log('error white deleting', error)
    //                 });

    //             }, (updateErr) => console.log("updateErr", updateErr));
    //         })
    //     }
    // })
    try {
      let cityDocs = await City.find({});

      await asyncForEach(cityDocs, async (city) => {
        console.log("Start updating city", city.name);
        let propDocs = await Property.find({ city: city.name, is_live: "2" });

        var priceArr = [];

        for (var j = 0; j < propDocs.length; j++) {
          if (propDocs[j].price && propDocs[j].price.price) {
            priceArr.push(propDocs[j].price.price);
          }
        }
        priceArr.sort(function (a, b) {
          return a - b;
        });
        var price = {
          min: null,
          max: null,
        };
        if (priceArr.length > 0) {
          price = {
            min: priceArr[0],
            max: priceArr[priceArr.length - 1],
          };
        }

        console.log("price", price);
        let data = await City.findOneAndUpdate(
          {
            //PICK EACH CITY AND UPDATE ITS PRICE OBJECT
            _id: city._id,
          },
          {
            $set: {
              price: price,
            },
          },
          { new: true, timestamps: false }
        );

        var clonedObj = { ...data };
        clonedObj._doc.location_details = clonedObj._doc.details;
        delete clonedObj._doc._id;
        delete clonedObj._doc.details;
        clonedObj._doc["location_type"] = "city";

        await Elastic.delete_entity_promise({
          match_phrase: { url: clonedObj._doc.url },
        });

        clonedObj._doc.doc_type = "location";
        clonedObj._doc.unique = 1;
        await Elastic.create_entitiy_promise(clonedObj._doc);
        console.log("Successfully updating city", city.name);
      });
      console.log("***PRICE IN CITIES UPDATION DONE***");
    } catch (error) {
      console.log("[Error updating price in City]", error);
    }
  },
  updatePriceInSubcity: async function () {
    // await Subcity.find({}).then(async (subCityDocs) => {
    //     for (let i = 0; i < subCityDocs.length; i++) { //PICK ONE SUBCITY
    //         var subcity = subCityDocs[i].name;
    //         await Property.find({ 'subcity': subcity, "is_live": "2" }).then(async (propDocs) => { // COUNT ALL THE PROJECTS HAVING THIS BUILDER
    //             var priceArr = []

    //             for (var j = 0; j < propDocs.length; j++) {
    //                 if (propDocs[j].price && propDocs[j].price.price) {
    //                     priceArr.push(propDocs[j].price.price)
    //                 }
    //             }
    //             priceArr.sort(function (a, b) { return a - b });
    //             var price = {
    //                 min: null,
    //                 max: null
    //             }
    //             if (priceArr.length > 0) {
    //                 price = {
    //                     min: priceArr[0],
    //                     max: priceArr[priceArr.length - 1]
    //                 }
    //             }
    //             await Subcity.findOneAndUpdate({ //PICK EACH SUBCITY AND UPDATE ITS PRICE OBJECT
    //                 _id: subCityDocs[i]._id
    //             }, {
    //                 $set: {
    //                     price: price
    //                 }
    //             }, { "new": true }).then(async (data) => {
    //                 var clonedObj = { ...data };
    //                 clonedObj._doc.location_details = clonedObj._doc.details
    //                 delete clonedObj._doc._id
    //                 delete clonedObj._doc.details
    //                 clonedObj._doc["location_type"] = "subcity"
    //                 await Elastic.delete_entity({ match_phrase: { url: clonedObj._doc.url } }).then(async (resp) => {
    //                     clonedObj._doc.doc_type = "location"
    //                     clonedObj._doc.unique = 1;
    //                     await Elastic.create_entitiy(clonedObj._doc).then(async (resp) => {
    //                         // console.log('create resp**********************************', resp)
    //                     }, async (err) => {
    //                         console.log('error white creating', err)
    //                     })
    //                 }, async (error) => {
    //                     console.log('error white deleting', error)
    //                 });

    //             }, (updateErr) => console.log("updateErr", updateErr));
    //         })
    //     }
    // })
    try {
      let subCityDocs = await Subcity.find({});
      await asyncForEach(subCityDocs, async (subcity) => {
        console.log("Start updating subcity", subcity.name);
        let propDocs = await Property.find({
          subcity: subcity.name,
          is_live: "2",
        });
        var priceArr = [];

        for (var j = 0; j < propDocs.length; j++) {
          if (propDocs[j].price && propDocs[j].price.price) {
            priceArr.push(propDocs[j].price.price);
          }
        }
        priceArr.sort(function (a, b) {
          return a - b;
        });
        var price = {
          min: null,
          max: null,
        };
        if (priceArr.length > 0) {
          price = {
            min: priceArr[0],
            max: priceArr[priceArr.length - 1],
          };
        }

        console.log("Price", price);
        let data = await Subcity.findOneAndUpdate(
          {
            //PICK EACH SUBCITY AND UPDATE ITS PRICE OBJECT
            _id: subcity._id,
          },
          {
            $set: {
              price: price,
            },
          },
          { new: true, timestamps: false }
        );

        var clonedObj = { ...data };
        clonedObj._doc.location_details = clonedObj._doc.details;
        delete clonedObj._doc._id;
        delete clonedObj._doc.details;
        clonedObj._doc["location_type"] = "subcity";
        await Elastic.delete_entity_promise({
          match_phrase: { url: clonedObj._doc.url },
        });
        clonedObj._doc.doc_type = "location";
        clonedObj._doc.unique = 1;

        await Elastic.create_entitiy_promise(clonedObj._doc);
        console.log("Successfully updating subcity", subcity.name);
      });
      console.log("***PRICE IN SUBCITIES UPDATION DONE***");
    } catch (error) {
      console.log("[Error updating price in SubCity]", error);
    }
  },
  // ____________________________________________________________
  propertyTypesInState: async function () {
    await State.find({}).then(
      async (stateDocs) => {
        // GET ALL AUTHORITIES
        for (let i = 0; i < stateDocs.length; i++) {
          //PICK ONE BUILDER
          var state = stateDocs[i].name;
          await Project.find({ state: state, is_live: "2" }).then(
            async (projDocs) => {
              // COUNT ALL THE PROJECTS HAVING THIS BUILDER
              var readytomove = 0,
                underconstruction = 0,
                prelaunch = 0;
              var status = {};
              for (var j = 0; j < projDocs.length; j++) {
                // console.log('project status is :', )
                if (projDocs[j].project_status == "Ready To Move") {
                  readytomove++;
                } else if (projDocs[j].project_status == "Under Construction") {
                  underconstruction++;
                } else if (projDocs[j].project_status == "Pre Launch") {
                  prelaunch++;
                }
              }
              if (prelaunch == 0) {
                prelaunch = null;
              }
              if (underconstruction == 0) {
                underconstruction = null;
              }
              if (readytomove == 0) {
                readytomove = null;
              }
              status = {
                PreLaunch: prelaunch,
                UnderConstruction: underconstruction,
                ReadyToMove: readytomove,
              };
              await State.findOneAndUpdate(
                {
                  //PICK EACH BUILDER AND UPDATE ITS STATUS_PROJECT ARRAY
                  _id: stateDocs[i]._id,
                },
                {
                  $set: {
                    project_status_count: status,
                  },
                },
                { new: true, timestamps: false }
              ).then(
                async (data) => {
                  var clonedObj = { ...data };
                  clonedObj._doc.location_details = clonedObj._doc.details;
                  delete clonedObj._doc._id;
                  delete clonedObj._doc.details;
                  clonedObj._doc["location_type"] = "state";
                  await Elastic.delete_entity({
                    match_phrase: { url: clonedObj._doc.url },
                  }).then(
                    async (resp) => {
                      clonedObj._doc.doc_type = "location";
                      clonedObj._doc.unique = 1;
                      await Elastic.create_entitiy(clonedObj._doc).then(
                        async (resp) => {
                          // console.log('create resp**********************************', resp)
                        },
                        async (err) => {
                          console.log("error white creating", err);
                        }
                      );
                    },
                    async (error) => {
                      console.log("error white deleting", error);
                    }
                  );
                },
                (updateErr) => console.log("updateErr", updateErr)
              );
            },
            (projDocsErr) => console.log("projDocsErr", projDocsErr)
          );
        }
      },
      (authDocsErr) => console.log("authDocsErr", authDocsErr)
    );
    console.log("*****UPDATION DONE*****");
  },
  propertyTypesInDistrict: async function () {
    await District.find({}).then(
      async (districtDocs) => {
        // GET ALL AUTHORITIES
        for (let i = 0; i < districtDocs.length; i++) {
          //PICK ONE BUILDER
          var district = districtDocs[i].name;
          await Project.find({ district: district, is_live: "2" }).then(
            async (projDocs) => {
              // COUNT ALL THE PROJECTS HAVING THIS BUILDER
              var readytomove = 0,
                underconstruction = 0,
                prelaunch = 0;
              var status = {};
              for (var j = 0; j < projDocs.length; j++) {
                // console.log('project status is :', )
                if (projDocs[j].project_status == "Ready To Move") {
                  readytomove++;
                } else if (projDocs[j].project_status == "Under Construction") {
                  underconstruction++;
                } else if (projDocs[j].project_status == "Pre Launch") {
                  prelaunch++;
                }
              }
              if (prelaunch == 0) {
                prelaunch = null;
              }
              if (underconstruction == 0) {
                underconstruction = null;
              }
              if (readytomove == 0) {
                readytomove = null;
              }
              status = {
                PreLaunch: prelaunch,
                UnderConstruction: underconstruction,
                ReadyToMove: readytomove,
              };
              await District.findOneAndUpdate(
                {
                  //PICK EACH BUILDER AND UPDATE ITS STATUS_PROJECT ARRAY
                  _id: districtDocs[i]._id,
                },
                {
                  $set: {
                    project_status_count: status,
                  },
                },
                { new: true, timestamps: false }
              ).then(
                async (data) => {
                  var clonedObj = { ...data };
                  clonedObj._doc.location_details = clonedObj._doc.details;
                  delete clonedObj._doc._id;
                  delete clonedObj._doc.details;
                  clonedObj._doc["location_type"] = "district";
                  await Elastic.delete_entity({
                    match_phrase: { url: clonedObj._doc.url },
                  }).then(
                    async (resp) => {
                      clonedObj._doc.doc_type = "location";
                      clonedObj._doc.unique = 1;
                      await Elastic.create_entitiy(clonedObj._doc).then(
                        async (resp) => {
                          // console.log('create resp**********************************', resp)
                        },
                        async (err) => {
                          console.log("error white creating", err);
                        }
                      );
                    },
                    async (error) => {
                      console.log("error white deleting", error);
                    }
                  );
                },
                (updateErr) => console.log("updateErr", updateErr)
              );
            },
            (projDocsErr) => console.log("projDocsErr", projDocsErr)
          );
        }
      },
      (authDocsErr) => console.log("authDocsErr", authDocsErr)
    );
    console.log("*****UPDATION DONE*****");
  },
  propertyTypesInCity: async function () {
    await City.find({}).then(
      async (cityDocs) => {
        // GET ALL AUTHORITIES
        for (let i = 0; i < cityDocs.length; i++) {
          //PICK ONE BUILDER
          var city = cityDocs[i].name;
          await Project.find({ city: city, is_live: "2" }).then(
            async (projDocs) => {
              // COUNT ALL THE PROJECTS HAVING THIS BUILDER
              var readytomove = 0,
                underconstruction = 0,
                prelaunch = 0;
              var status = {};
              for (var j = 0; j < projDocs.length; j++) {
                // console.log('project status is :', )
                if (projDocs[j].project_status == "Ready To Move") {
                  readytomove++;
                } else if (projDocs[j].project_status == "Under Construction") {
                  underconstruction++;
                } else if (projDocs[j].project_status == "Pre Launch") {
                  prelaunch++;
                }
              }
              if (prelaunch == 0) {
                prelaunch = null;
              }
              if (underconstruction == 0) {
                underconstruction = null;
              }
              if (readytomove == 0) {
                readytomove = null;
              }
              status = {
                PreLaunch: prelaunch,
                UnderConstruction: underconstruction,
                ReadyToMove: readytomove,
              };
              await City.findOneAndUpdate(
                {
                  //PICK EACH BUILDER AND UPDATE ITS STATUS_PROJECT ARRAY
                  _id: cityDocs[i]._id,
                },
                {
                  $set: {
                    project_status_count: status,
                  },
                },
                { new: true, timestamps: false }
              ).then(
                async (data) => {
                  var clonedObj = { ...data };
                  clonedObj._doc.location_details = clonedObj._doc.details;
                  delete clonedObj._doc._id;
                  delete clonedObj._doc.details;
                  clonedObj._doc["location_type"] = "city";
                  await Elastic.delete_entity({
                    match_phrase: { url: clonedObj._doc.url },
                  }).then(
                    async (resp) => {
                      clonedObj._doc.doc_type = "location";
                      clonedObj._doc.unique = 1;
                      await Elastic.create_entitiy(clonedObj._doc).then(
                        async (resp) => {
                          // console.log('create resp**********************************', resp)
                        },
                        async (err) => {
                          console.log("error white creating", err);
                        }
                      );
                    },
                    async (error) => {
                      console.log("error white deleting", error);
                    }
                  );
                },
                (updateErr) => console.log("updateErr", updateErr)
              );
            },
            (projDocsErr) => console.log("projDocsErr", projDocsErr)
          );
        }
      },
      (authDocsErr) => console.log("authDocsErr", authDocsErr)
    );
    console.log("*****UPDATION DONE*****");
  },
  propertyTypesInSubCity: async function () {
    await Subcity.find({}).then(
      async (subcityDocs) => {
        // GET ALL AUTHORITIES
        for (let i = 0; i < subcityDocs.length; i++) {
          //PICK ONE BUILDER
          var subcity = subcityDocs[i].name;
          await Project.find({ subcity: subcity, is_live: "2" }).then(
            async (projDocs) => {
              // COUNT ALL THE PROJECTS HAVING THIS BUILDER
              var readytomove = 0,
                underconstruction = 0,
                prelaunch = 0;
              var status = {};
              for (var j = 0; j < projDocs.length; j++) {
                // console.log('project status is :', )
                if (projDocs[j].project_status == "Ready To Move") {
                  readytomove++;
                } else if (projDocs[j].project_status == "Under Construction") {
                  underconstruction++;
                } else if (projDocs[j].project_status == "Pre Launch") {
                  prelaunch++;
                }
              }
              if (prelaunch == 0) {
                prelaunch = null;
              }
              if (underconstruction == 0) {
                underconstruction = null;
              }
              if (readytomove == 0) {
                readytomove = null;
              }
              status = {
                PreLaunch: prelaunch,
                UnderConstruction: underconstruction,
                ReadyToMove: readytomove,
              };
              await Subcity.findOneAndUpdate(
                {
                  //PICK EACH BUILDER AND UPDATE ITS STATUS_PROJECT ARRAY
                  _id: subcityDocs[i]._id,
                },
                {
                  $set: {
                    project_status_count: status,
                  },
                },
                { new: true, timestamps: false }
              ).then(
                async (data) => {
                  var clonedObj = { ...data };
                  clonedObj._doc.location_details = clonedObj._doc.details;
                  delete clonedObj._doc._id;
                  delete clonedObj._doc.details;
                  clonedObj._doc["location_type"] = "subcity";
                  await Elastic.delete_entity({
                    match_phrase: { url: clonedObj._doc.url },
                  }).then(
                    async (resp) => {
                      clonedObj._doc.doc_type = "location";
                      clonedObj._doc.unique = 1;
                      await Elastic.create_entitiy(clonedObj._doc).then(
                        async (resp) => {
                          // console.log('create resp**********************************', resp)
                        },
                        async (err) => {
                          console.log("error white creating", err);
                        }
                      );
                    },
                    async (error) => {
                      console.log("error white deleting", error);
                    }
                  );
                },
                (updateErr) => console.log("updateErr", updateErr)
              );
            },
            (projDocsErr) => console.log("projDocsErr", projDocsErr)
          );
        }
      },
      (authDocsErr) => console.log("authDocsErr", authDocsErr)
    );
    console.log(
      "*************************************FINISHEDUPDATION DONE***********************************"
    );
  },
  // ____________________________________________________________
  addProjectUrlInProperty: async function () {
    console.log("getting properties");
    var projName, type;
    await Property.find({}).then(async (propertyDocs) => {
      for (var a = 0; a <= propertyDocs.length; a++) {
        if (propertyDocs && propertyDocs[a]) {
          console.log(
            "# ",
            propertyDocs[a].project,
            " : ",
            propertyDocs[a].property_type
          );
          projName = propertyDocs[a].project;
          type = propertyDocs[a].property_type;
          await Project.findOne({ name: projName, property_type: type }).then(
            async (projDocs) => {
              if (projDocs && projDocs.name) {
                console.log("Project is ", projDocs.url, "\n");

                await Property.findOneAndUpdate(
                  {
                    //PICK EACH PROJECT AND UPDATE ITS area OBJECT
                    _id: propertyDocs[a]._id,
                  },
                  {
                    $set: {
                      project_url: projDocs.url,
                    },
                  },
                  { new: true, timestamps: false }
                ).then(
                  async (data) => {
                    var clonedObj = { ...data };
                    delete clonedObj._doc._id;
                    await Elastic.delete_entity({
                      match_phrase: { url: clonedObj._doc.url },
                    }).then(
                      async (resp) => {
                        clonedObj._doc.doc_type = "property";
                        clonedObj._doc.unique = 1;
                        await Elastic.create_entitiy(clonedObj._doc).then(
                          async (resp) => {
                            console.log(
                              "_____________________________________________________________________________"
                            );
                          },
                          async (err) => {
                            console.log("error white creating", err);
                          }
                        );
                      },
                      async (error) => {
                        console.log("error white deleting", error);
                      }
                    );
                  },
                  (updateErr) => console.log("updateErr", updateErr)
                );
              }
            }
          );
        }
      }
    });
  },
  updateSqFitCostOfPropertyInProject: async function () {
    try {
      let projectDocs = await Project.find({});
      await asyncForEach(projectDocs, async (project) => {
        console.log("Start Updating Project", project.name);

        let propDocs = await Property.find({
          project: project.name,
          is_live: "2",
        });

        propDocs = JSON.parse(JSON.stringify(propDocs));

        for (var j = 0; j < propDocs.length; j++) {
          console.log("Square fit cost", propDocs[j].sq_fit_cost);
          // propDocs[j].sq_ft_cost = null
          // if (propDocs[j].area && propDocs[j].area.area && propDocs[j].price && propDocs[j].price.price) {
          //   propDocs[j].sq_ft_cost = Math.round(property.price.price / property.area.area)
          // }
        }

        // find sq ft cost
        var sqfitCost = [];
        for (var j = 0; j < propDocs.length; j++) {
          if (propDocs[j].sq_fit_cost && propDocs[j].sq_fit_cost.cost) {
            sqfitCost.push(propDocs[j].sq_fit_cost.cost);
          }
        }

        console.log("sqfitCost", sqfitCost);

        sqfitCost.sort(function (a, b) {
          return a - b;
        });

        // Sq_fit_cost
        let sq_fit_cost_temp = {
          min: null,
          max: null,
        };

        if (sqfitCost.length > 0) {
          sq_fit_cost_temp["min"] = sqfitCost[0];
          sq_fit_cost_temp["max"] = sqfitCost[sqfitCost.length - 1];
        }

        console.log("sq_fit_cost_temp", sq_fit_cost_temp);

        let data = await Project.findOneAndUpdate(
          {
            //PICK EACH PROJECT AND UPDATE ITS Sq Fit Cost OBJECT
            _id: project._id,
          },
          {
            $set: {
              sq_fit_cost: sq_fit_cost_temp,
            },
          },
          { new: true, timestamps: false }
        );

        var clonedObj = { ...data };
        delete clonedObj._doc._id;
        await Elastic.delete_entity_promise({
          match_phrase: { url: clonedObj._doc.url },
        });

        clonedObj._doc.doc_type = "project";
        clonedObj._doc.unique = 1;
        await Elastic.create_entitiy_promise(clonedObj._doc);

        console.log("updated Project", project.name);
      });
    } catch (error) {
      console.log("[Error updating area in project]", error);
    }
    console.log("All Projects are updated successfully.");
  },
  updateSqFitCostInProperty: async function () {
    try {
      let prpertyDocs = await Property.find({});
      await asyncForEach(prpertyDocs, async (property) => {
        console.log("Start Updating Propery", property.name);
        let sq_ft_cost = {
          cost: null,
        };
        if (
          property.area &&
          property.area.area &&
          property.price &&
          property.price.price
        ) {
          sq_ft_cost.cost = Math.round(
            property.price.price / property.area.area
          );
        }

        console.log("sq_ft_cost", sq_ft_cost);
        let data = await Property.findOneAndUpdate(
          {
            //PICK EACH property AND UPDATE ITS Sq Fit Cost OBJECT
            _id: property._id,
          },
          {
            $set: {
              sq_fit_cost: sq_ft_cost,
            },
          },
          { new: true, timestamps: false }
        );

        var clonedObj = { ...data };
        delete clonedObj._doc._id;
        await Elastic.delete_entity_promise({
          match_phrase: { url: clonedObj._doc.url },
        });
        clonedObj._doc.doc_type = "property";
        clonedObj._doc.unique = 1;
        await Elastic.create_entitiy_promise(clonedObj._doc);
        console.log("updated property", property.name);
      });
    } catch (error) {
      console.log("[Error updating SQ fit in property]", error);
    }
    console.log("All Projects are updated successfully.");
  },
  // updateLocationBoundriesForState: async function () {
  //     return new Promise(async (resolve, reject) => {
  //         try {

  //             let allBoundries = fs.readFileSync("./india_administrative_state_boundary.geojson");

  //             allBoundries = JSON.parse(allBoundries);
  //             console.log()
  //             let statesDocs = await State.find({isBoundryAdded: {$in: [null, false]}});
  //             // allBoundries.features.forEach((a) => {
  //             //     console.log("State is", a.properties.st_nm, a.geometry.type)
  //             // })
  //             await asyncForEach(statesDocs, async (state) => {
  //                 // console.log("Id of state is", state.id)
  //                 // let geoJSONOfState = allBoundries.features.find((s) => s.properties.st_nm === state.name);

  //                 // if(geoJSONOfState) {
  //                     let name = state.name.split(" ").join("+");

  //                     // let geometry = geoJSONOfState.geometry;
  //                     // console.log("geometry", geometry.type)
  //                     let innerCoordinate = []
  //                     console.log("Changed name is", name)
  //                     let allBounData = await axios.get(`https://nominatim.openstreetmap.org/search.php?q=${name}&polygon_geojson=1&format=geojson`);

  //                     allBounData = allBounData.data;
  //                     console.log("allBounData", allBounData.length);

  //                     allBounData.features = allBounData.features.filter((sub) => sub.geometry.type === "MultiPolygon" || sub.geometry.type === "Polygon");

  //                     if(allBounData.features.length > 0) {
  //                         let result = await Boundary.updateOne({
  //                                 location_type: "state",
  //                                 id: state.id
  //                             }, {
  //                                 $set: {
  //                                    "geoJSON":  allBounData
  //                                 }
  //                             }, {
  //                                 upsert: true
  //                             });

  //                             await State.update({
  //                                 _id: state._id
  //                             }, {
  //                                 $set: {
  //                                     isBoundryAdded: true
  //                                 }
  //                             });

  //                             let geojson = allBounData.features[0].geometry;
  //                             // console.log("geojson.type", geojson.type)
  //                             if(geojson && geojson.type == "Polygon") {

  //                                 geojson.coordinates[0].forEach((corodinateObj) => {
  //                                     innerCoordinate.push([corodinateObj[1], corodinateObj[0]])
  //                                 });

  //                             } else if(geojson && geojson.type == "MultiPolygon") {
  //                                 geojson.coordinates.forEach((corodinateObj, index) => {
  //                                     corodinateObj[0].forEach((obj1) => {
  //                                         innerCoordinate.push([obj1[1], obj1[0]])
  //                                     });
  //                                 });

  //                             }

  //                             if((state.name === "Arunachal Pradesh" || state.name === "Assam" || state.name === "Gujarat") && innerCoordinate.length > 0) {
  //                                 await Boundary.updateOne({
  //                                     location_type: "state",
  //                                     id: state.id
  //                                 }, {
  //                                     $set: {
  //                                        "boundary":  innerCoordinate
  //                                     }
  //                                 }, {
  //                                     upsert: true
  //                                 });
  //                             }
  //                     } else {
  //                         console.log("Data not found for", state.name)
  //                     }
  //             })
  //             console.log("All states processed successfully.");
  //             resolve(true)
  //         } catch(error) {
  //             console.log("Erro fetching result", error);
  //             reject(error)
  //         }
  //     })
  // },
  // updateLocationBoundriesForDistrict: async function () {
  //     return new Promise(async (resolve, reject) => {
  //         try {

  //             let allBoundries = fs.readFileSync("./india_administrative_boundaries_district_level.geojson");

  //             allBoundries = JSON.parse(allBoundries);

  //             let districtDocs = await District.find({isBoundryAdded: {$in: [null, false]}});
  //             await asyncForEach(districtDocs, async (district) => {
  //                 console.log("Processing District", district.name, district._id);
  //                 let innerCoordinate = [];
  //                 let adminDistrict = ["Gautambudh Nagar", "Ghaziabad", "Jaipur", "Meerut", "Alwar", "Bengaluru Urban", "Kanpur Nagar", "Lucknow"]
  //                 let alreadyCorrect = ["New Delhi",  "Faridabad", "North East Delhi", "West Delhi", "Gurgaon"]

  //                 if(alreadyCorrect.indexOf(district.name) !== -1) {
  //                     //Do Nothing already correct
  //                     console.log("Already correct");
  //                 } else if(adminDistrict.indexOf(district.name) !== -1) {
  //                     console.log("From Admin DB")
  //                     let featuresArray = allBoundries.features.filter((s) => {
  //                         district.name = district.name.trim();
  //                         return  s.properties.district == district.name
  //                     });

  //                     if(featuresArray && featuresArray.length > 0) {
  //                         console.log("District found in JSON.")
  //                         let result = await Boundary.updateOne({
  //                             location_type: "district",
  //                             id: district.id
  //                         }, {
  //                             $set: {
  //                                "geoJSON":  Object.assign({}, allBoundries, {
  //                                   features: featuresArray
  //                                })
  //                             }
  //                         }, {
  //                             upsert: true
  //                         });

  //                         await District.update({
  //                             _id: district._id
  //                         }, {
  //                             $set: {
  //                                 isBoundryAdded: true
  //                             }
  //                         });

  //                         let geojson = featuresArray[0].geometry;
  //                         console.log("geojson.type", geojson)
  //                         if(geojson && geojson.type == "Polygon") {
  //                             console.log("1111");
  //                             geojson.coordinates[0].forEach((corodinateObj) => {
  //                                 innerCoordinate.push([corodinateObj[1], corodinateObj[0]])
  //                             });

  //                         } else if(geojson && geojson.type == "MultiPolygon") {
  //                             console.log("2222");
  //                             geojson.coordinates.forEach((corodinateObj, index) => {
  //                                 corodinateObj[0].forEach((obj1) => {
  //                                     innerCoordinate.push([obj1[1], obj1[0]])
  //                                 });
  //                             });

  //                         }

  //                     }
  //                 } else {
  //                      console.log("From API");
  //                     let name = district.name.split(" ").join("+");
  //                     console.log("Name to send for search", name)
  //                     let allBounData = await axios.get(`https://nominatim.openstreetmap.org/search.php?q=${name}&polygon_geojson=1&format=geojson`);

  //                     allBounData = allBounData.data;

  //                     allBounData.features = allBounData.features.filter((sub) => sub.geometry.type === "MultiPolygon" || sub.geometry.type === "Polygon");
  //                     // allBounData.features = allBounData.features.splice(1, allBounData.features.length)

  //                     if(allBounData.features.length > 0) {
  //                         // console.log("Location Found")
  //                         let result = await Boundary.updateOne({
  //                                 location_type: "district",
  //                                 id: district.id
  //                             }, {
  //                                 $set: {
  //                                    "geoJSON":  allBounData
  //                                 }
  //                             }, {
  //                                 upsert: true
  //                             });

  //                            let updateResult = await District.update({
  //                                 _id: district._id
  //                             }, {
  //                                 $set: {
  //                                     isBoundryAdded: true
  //                                 }
  //                             });
  //                            // console.log("updateResult", updateResult)
  //                            let geojson = allBounData.features[0].geometry;
  //                             // console.log("geojson.type", geojson.type)
  //                             if(geojson && geojson.type == "Polygon") {

  //                                 geojson.coordinates[0].forEach((corodinateObj) => {
  //                                     innerCoordinate.push([corodinateObj[1], corodinateObj[0]])
  //                                 });

  //                             } else if(geojson && geojson.type == "MultiPolygon") {
  //                                 geojson.coordinates.forEach((corodinateObj, index) => {
  //                                     corodinateObj[0].forEach((obj1) => {
  //                                         innerCoordinate.push([obj1[1], obj1[0]])
  //                                     });
  //                                 });

  //                             }
  //                     } else {
  //                         console.log("Data not found for", district.name)
  //                     }

  //                 }
  //                 console.log("Length is", innerCoordinate.length)
  //                 if(innerCoordinate.length > 0) {
  //                     let result = await Boundary.updateOne({
  //                         location_type: "district",
  //                         id: district.id
  //                     }, {
  //                         $set: {
  //                            "boundary":  innerCoordinate
  //                         }
  //                     }, {
  //                         upsert: true
  //                     });
  //                 }
  //             })
  //             console.log("All district processed successfully.");
  //             resolve(true)
  //         } catch(error) {
  //             console.log("Erro fetching result", error)
  //              reject(error)
  //         }
  //     })
  // },
  // updateLocationBoundriesForCities: async function () {
  //     return new Promise(async (resolve, reject) => {
  //         try {

  //             let cityDocs = await City.find({isBoundryAdded: {$in: [null, false]}});
  //             await asyncForEach(cityDocs, async (city) => {
  //                 // console.log("Processing City", city.name, city._id)
  //                 let name = city.name.split(" ").join("+");
  //                     // console.log("Name to send for search", name)
  //                 let allBounData = await axios.get(`https://nominatim.openstreetmap.org/search.php?q=${name}&polygon_geojson=1&format=geojson`);

  //                 allBounData = allBounData.data;

  //                 allBounData.features = allBounData.features.filter((sub) => sub.geometry.type === "MultiPolygon" || sub.geometry.type === "Polygon");

  //                 if(allBounData.features.length > 0) {
  //                     // console.log("Location Found")
  //                     let result = await Boundary.updateOne({
  //                             location_type: "city",
  //                             id: city.id
  //                         }, {
  //                             $set: {
  //                                "geoJSON":  allBounData
  //                             }
  //                         }, {
  //                             upsert: true
  //                         });

  //                        let updateResult = await City.update({
  //                             _id: city._id
  //                         }, {
  //                             $set: {
  //                                 isBoundryAdded: true
  //                             }
  //                         });
  //                        let geojson = allBounData.features[0].geometry,
  //                         innerCoordinate = [];
  //                             // console.log("geojson.type", geojson.type)
  //                         if(geojson && geojson.type == "Polygon") {

  //                             geojson.coordinates[0].forEach((corodinateObj) => {
  //                                 innerCoordinate.push([corodinateObj[1], corodinateObj[0]])
  //                             });

  //                         } else if(geojson && geojson.type == "MultiPolygon") {
  //                             geojson.coordinates.forEach((corodinateObj, index) => {
  //                                 corodinateObj[0].forEach((obj1) => {
  //                                     innerCoordinate.push([obj1[1], obj1[0]])
  //                                 });
  //                             });

  //                         }
  //                         console.log("Length is", innerCoordinate.length)
  //                         if(innerCoordinate.length > 0) {
  //                             let result = await Boundary.updateOne({
  //                                 location_type: "city",
  //                                 id: city.id
  //                             }, {
  //                                 $set: {
  //                                    "boundary":  innerCoordinate
  //                                 }
  //                             }, {
  //                                 upsert: true
  //                             });
  //                         }
  //                 } else {
  //                     console.log("Data not found for", city.name)
  //                 }
  //             })
  //             console.log("All Cities processed successfully.");
  //             resolve(true)
  //         } catch(error) {
  //             console.log("Erro fetching result", error)
  //              reject(error)
  //         }
  //     })
  // },

  // updateLocationBoundriesForSubCities: async function () {
  //      return new Promise(async (resolve, reject) => {
  //         try {

  //             let cityDocs = await Subcity.find({isBoundryAdded: {$in: [null, false]}});
  //             await asyncForEach(cityDocs, async (city) => {
  //                 // console.log("Processing City", city.name, city._id)
  //                 let name = city.name.split(" ").join("+");
  //                     // console.log("Name to send for search", name)
  //                 let allBounData = await axios.get(`https://nominatim.openstreetmap.org/search.php?q=${name}&polygon_geojson=1&format=geojson`);

  //                 allBounData = allBounData.data;

  //                 allBounData.features = allBounData.features.filter((sub) => sub.geometry.type === "MultiPolygon" || sub.geometry.type === "Polygon");

  //                 if(allBounData.features.length > 0) {
  //                      console.log("Found Data for", city.name)
  //                     // console.log("Location Found")
  //                     let result = await Boundary.updateOne({
  //                             location_type: "subcity",
  //                             id: city.id
  //                         }, {
  //                             $set: {
  //                                "geoJSON":  allBounData
  //                             }
  //                         }, {
  //                             upsert: true
  //                         });

  //                        let updateResult = await Subcity.update({
  //                             _id: city._id
  //                         }, {
  //                             $set: {
  //                                 isBoundryAdded: true
  //                             }
  //                         });
  //                        let geojson = allBounData.features[0].geometry,
  //                         innerCoordinate = [];
  //                             // console.log("geojson.type", geojson.type)
  //                         if(geojson && geojson.type == "Polygon") {

  //                             geojson.coordinates[0].forEach((corodinateObj) => {
  //                                 innerCoordinate.push([corodinateObj[1], corodinateObj[0]])
  //                             });

  //                         } else if(geojson && geojson.type == "MultiPolygon") {
  //                             geojson.coordinates.forEach((corodinateObj, index) => {
  //                                 corodinateObj[0].forEach((obj1) => {
  //                                     innerCoordinate.push([obj1[1], obj1[0]])
  //                                 });
  //                             });

  //                         }
  //                         console.log("Length is", innerCoordinate.length)
  //                         if(innerCoordinate.length > 0) {
  //                             let result = await Boundary.updateOne({
  //                                 location_type: "subcity",
  //                                 id: city.id
  //                             }, {
  //                                 $set: {
  //                                    "boundary":  innerCoordinate
  //                                 }
  //                             }, {
  //                                 upsert: true
  //                             });
  //                         }
  //                 } else {
  //                     console.log("Data not found for", city.name)
  //                 }
  //             })
  //             console.log("All Sub Cities processed successfully.");
  //             resolve(true)
  //         } catch(error) {
  //             console.log("Erro fetching result", error)
  //              reject(error)
  //         }
  //     })
  // }
};

const updateBuilderName = async (builders) => {
  await asyncForEach(builders, async (build, index) => {
    console.log("Index is", index);
    // setTimeout(async () => {
    try {
      let builder = await Builder.findOne({ name: build.name, is_live: 2 });
      if (builder) {
        console.log("ID of Builder", builder.id);
        // let url =
        //   "/builders/" + build.newName.split(" ").join("-") + "-" + builder.id;
        let url = "/builders/" + slugify(build.newName, slugifyOptions) + "-" + builder.id;
        //Update builder
        await Builder.findOneAndUpdate(
          { _id: builder._id },
          {
            $set: {
              name: build.newName,
              url,
            },
          }
        );

        let updateResult = await Elastic.update_entity_promise(
          {
            bool: {
              must: [
                { match_phrase: { name: build.name } },
                { term: { doc_type: "builder" } },
                { term: { is_live: 2 } },
              ],
            },
          },
          {
            inline: `ctx._source.name = '${build.newName}';ctx._source.url = '${url}'`,
          }
        );

        //Update Project
        let updateProjectResultDB = await Project.updateMany(
          {
            builder: build.name,
          },
          {
            $set: {
              builder: build.newName,
            },
          }
        );

        console.log("updateProjectResultDB", updateProjectResultDB);

        let updateProjectResult = await Elastic.update_entity_promise(
          {
            bool: {
              must: [
                { match_phrase: { builder: build.name } },
                { term: { doc_type: "project" } },
              ],
            },
          },
          {
            inline: `ctx._source.builder = '${build.newName}'`,
          }
        );

        console.log("updateProjectResult", updateProjectResult.data);

        //Update Property
        let updatePropertyResultDB = await Property.updateMany(
          {
            builder: build.name,
          },
          {
            $set: {
              builder: build.newName,
            },
          }
        );

        console.log("updatePropertyResultDB", updatePropertyResultDB);

        let updatePropertyResult = await Elastic.update_entity_promise(
          {
            bool: {
              must: [
                { match_phrase: { builder: build.name } },
                { term: { doc_type: "property" } },
              ],
            },
          },
          {
            inline: `ctx._source.builder = '${build.newName}'`,
          }
        );

        console.log("updatePropertyResult", updatePropertyResult.data);
      } else {
        console.log("No Builder found to update with name", build.name);
      }
    } catch (error) {
      console.log("Error Updating records", error.response);
    }
    // }, 10000 * index)
  });
};

const updateProjectName = async (projects) => {
  await asyncForEach(projects, async (project, index) => {
    console.log("Index is", index);
    // setTimeout(async () => {
    try {
      let projectObj = await Project.findOne({ name: project.name });
      if (projectObj) {
        // let url =
        //   "/projects/" +
        //   project.newName.split(" ").join("-") +
        //   "-" +
        //   projectObj.id;
        let url = "/projects/" + slugify(project.newName, slugifyOptions) + "-" + projectObj.id;
        //Update Project
        await Project.findOneAndUpdate(
          { _id: projectObj._id },
          {
            $set: {
              name: project.newName,
              url,
            },
          }
        );

        let updateResult = await Elastic.update_entity_promise(
          {
            bool: {
              must: [
                { match_phrase: { name: project.name } },
                { term: { doc_type: "project" } },
              ],
            },
          },
          {
            inline: `ctx._source.name = '${project.newName}';ctx._source.url = '${url}'`,
          }
        );

        //Update Property
        let updatePropertyResultDB = await Property.updateMany(
          {
            project: project.name,
          },
          {
            $set: {
              project: project.newName,
            },
          }
        );

        console.log("updatePropertyResultDB", updatePropertyResultDB);

        let updatePropertyResult = await Elastic.update_entity_promise(
          {
            bool: {
              must: [
                { match_phrase: { project: project.name } },
                { term: { doc_type: "property" } },
              ],
            },
          },
          {
            inline: `ctx._source.project = '${project.newName}'`,
          }
        );

        console.log("updatePropertyResult", updatePropertyResult.data);
      } else {
        console.log("No Project found to update with name", project.name);
      }
    } catch (error) {
      console.log("Error Updating records", error);
    }
    // }, 1000 * index)
  });
};

const updateSubCityName = async (subsities) => {
  console.log("subsities", subsities);
  await asyncForEach(subsities, async (subcity, index) => {
    console.log("Index is", index);
    // setTimeout(async () => {
    try {
      let subcityObj = await Subcity.findOne({ name: subcity.name });
      if (subcityObj) {
        // let url =
        //   "/locations/" +
        //   subcity.newName.split(" ").join("-") +
        //   "-subcity-" +
        //   subcityObj.id;
        let url =
          "/locations/" +
          slugify(subcity.newName, slugifyOptions) +
          "-subcity-" +
          subcityObj.id;
        //Update Subcity
        await Subcity.findOneAndUpdate(
          { _id: subcityObj._id },
          {
            $set: {
              name: subcity.newName,
              url,
            },
          }
        );

        let updateResult = await Elastic.update_entity_promise(
          {
            bool: {
              must: [
                { match_phrase: { name: subcity.name } },
                { term: { doc_type: "location" } },
              ],
            },
          },
          {
            inline: `ctx._source.name = '${subcity.newName}';ctx._source.url = '${url}'`,
          }
        );

        //Update Builder
        let updateBuilderResultDB = await Builder.updateMany(
          {
            subcity: subcity.name,
          },
          {
            $set: {
              subcity: subcity.newName,
            },
          }
        );

        console.log("updatePropertyResultDB", updateBuilderResultDB);

        let updateBuilderResult = await Elastic.update_entity_promise(
          {
            bool: {
              must: [
                { match_phrase: { subcity: subcity.name } },
                { term: { doc_type: "builder" } },
              ],
            },
          },
          {
            inline: `ctx._source.subcity = '${subcity.newName}'`,
          }
        );

        //Update Projects
        let updateProjectResultDB = await Project.updateMany(
          {
            subcity: subcity.name,
          },
          {
            $set: {
              subcity: subcity.newName,
            },
          }
        );

        let updateProjectResult = await Elastic.update_entity_promise(
          {
            bool: {
              must: [
                { match_phrase: { subcity: subcity.name } },
                { term: { doc_type: "project" } },
              ],
            },
          },
          {
            inline: `ctx._source.subcity = '${subcity.newName}'`,
          }
        );

        //Update Property
        let updatePropertyResultDB = await Property.updateMany(
          {
            subcity: subcity.name,
          },
          {
            $set: {
              subcity: subcity.newName,
            },
          }
        );

        console.log("updatePropertyResultDB", updatePropertyResultDB);

        let updatePropertyResult = await Elastic.update_entity_promise(
          {
            bool: {
              must: [
                { match_phrase: { subcity: subcity.name } },
                { term: { doc_type: "property" } },
              ],
            },
          },
          {
            inline: `ctx._source.subcity = '${subcity.newName}'`,
          }
        );
      } else {
        console.log("No Subcity found to update with name", subcity.name);
      }
    } catch (error) {
      console.log("Error Updating records", error);
    }
  });
};

const updateAuthorityName = async (authorities) => {
  await asyncForEach(authorities, async (authority, index) => {
    try {
      let authorityObj = await Authority.findOne({ name: authority.name });
      if (authorityObj) {
        // let url =
        //   "/authorities/" +
        //   authority.newName.split(" ").join("-") +
        //   "-" +
        //   authorityObj.id;
        let url =
          "/authorities/" + slugify(authority.newName, slugifyOptions) + "-" + authorityObj.id;
        //Update Authorities
        await Authority.findOneAndUpdate(
          { _id: authorityObj._id },
          {
            $set: {
              name: authority.newName,
              url,
            },
          }
        );

        let updateResult = await Elastic.update_entity_promise(
          {
            bool: {
              must: [
                { match_phrase: { name: authority.name } },
                { term: { doc_type: "authority" } },
              ],
            },
          },
          {
            inline: `ctx._source.name = '${authority.newName}';ctx._source.url = '${url}'`,
          }
        );

        //Update Projects
        let updateProjectResultDB = await Project.updateMany(
          {
            authority: authority.name,
          },
          {
            $set: {
              authority: authority.newName,
            },
          }
        );

        let updateProjectResult = await Elastic.update_entity_promise(
          {
            bool: {
              must: [
                { match_phrase: { authority: authority.name } },
                { term: { doc_type: "project" } },
              ],
            },
          },
          {
            inline: `ctx._source.authority = '${authority.newName}'`,
          }
        );

        //Update Property
        let updatePropertyResultDB = await Property.updateMany(
          {
            authority: authority.name,
          },
          {
            $set: {
              authority: authority.newName,
            },
          }
        );

        let updatePropertyResult = await Elastic.update_entity_promise(
          {
            bool: {
              must: [
                { match_phrase: { authority: authority.name } },
                { term: { doc_type: "property" } },
              ],
            },
          },
          {
            inline: `ctx._source.authority = '${authority.newName}'`,
          }
        );
      } else {
        console.log("No authority found to update with name", authority.name);
      }
    } catch (error) {
      console.log("Error Updating records", error);
    }
  });
};

// const updateDistrictName = async (districts) => {
//   await asyncForEach(districts, async (build, index) => {
//       console.log("Index is", index)
//       // setTimeout(async () => {
//           try {
//               let district = await District.findOne({ name: build.name, is_live: 2 });
//               if (district) {
//                   console.log("ID of district", district.id)
//                   let url = "/locations/" + build.newName.split(" ").join("-") + "-" + district.id;
//                   //Update district
//                   await District.findOneAndUpdate({ _id: district._id }, {
//                       $set: {
//                           name: build.newName,
//                           url
//                       }
//                   });

//                   let updateResult = await Elastic.update_entity_promise({
//                       "bool": {
//                           "must": [{ "match_phrase": { "name": build.name } }, { "term": { "doc_type": "district" } }, { "term": { "is_live": 2 }}]
//                       }
//                   }, {
//                       "inline": `ctx._source.name = '${build.newName}';ctx._source.url = '${url}'`
//                   });

//                   //Update Project
//                   let updateProjectResultDB = await Project.updateMany({
//                       district: build.name
//                   }, {
//                       $set: {
//                           district: build.newName,
//                       }
//                   });

//                   console.log("updateProjectResultDB", updateProjectResultDB)

//                   let updateProjectResult = await Elastic.update_entity_promise({
//                       "bool": {
//                           "must": [{ "match_phrase": { "district": build.name } }, { "term": { "doc_type": "project" } }]
//                       }
//                   }, {
//                       "inline": `ctx._source.district = '${build.newName}'`
//                   });

//                   console.log("updateProjectResult", updateProjectResult.data)

//                   //Update Property
//                   let updatePropertyResultDB = await Property.updateMany({
//                       district: build.name
//                   }, {
//                       $set: {
//                           district: build.newName,
//                       }
//                   });

//                   console.log("updatePropertyResultDB", updatePropertyResultDB)

//                   let updatePropertyResult = await Elastic.update_entity_promise({
//                       "bool": {
//                           "must": [{ "match_phrase": { "district": build.name } }, { "term": { "doc_type": "property" } }]
//                       }
//                   }, {
//                       "inline": `ctx._source.district = '${build.newName}'`
//                   });

//                   console.log("updatePropertyResult", updatePropertyResult.data)

//               } else {
//                   console.log("No district found to update with name", build.name);
//               }
//           } catch (error) {
//               console.log("Error Updating records", error.response)
//           }
//       // }, 10000 * index)
//   });
// }

const updateDistrictName = async (subsities) => {
  await asyncForEach(subsities, async (subcity, index) => {
    console.log("Index is", index);
    // setTimeout(async () => {
    try {
      let subcityObj = await District.findOne({ name: subcity.name });
      if (subcityObj) {
        // let url =
        //   "/locations/" +
        //   subcity.newName.split(" ").join("-") +
        //   "-subcity-" +
        //   subcityObj.id;
        let url =
          "/locations/" +
          slugify(subcity.newName, slugifyOptions) +
          "-subcity-" +
          subcityObj.id;
        //Update Subcity
        await District.findOneAndUpdate(
          { _id: subcityObj._id },
          {
            $set: {
              name: subcity.newName,
              url,
            },
          }
        );

        let updateResult = await Elastic.update_entity_promise(
          {
            bool: {
              must: [
                { match_phrase: { name: subcity.name } },
                { term: { doc_type: "location" } },
              ],
            },
          },
          {
            inline: `ctx._source.name = '${subcity.newName}';ctx._source.url = '${url}'`,
          }
        );

        //Update Builder
        let updateBuilderResultDB = await Builder.updateMany(
          {
            district: subcity.name,
          },
          {
            $set: {
              district: subcity.newName,
            },
          }
        );

        console.log("updatePropertyResultDB", updateBuilderResultDB);

        let updateBuilderResult = await Elastic.update_entity_promise(
          {
            bool: {
              must: [
                { match_phrase: { district: subcity.name } },
                { term: { doc_type: "builder" } },
              ],
            },
          },
          {
            inline: `ctx._source.district = '${subcity.newName}'`,
          }
        );

        //Update Projects
        let updateProjectResultDB = await Project.updateMany(
          {
            district: subcity.name,
          },
          {
            $set: {
              district: subcity.newName,
            },
          }
        );

        let updateProjectResult = await Elastic.update_entity_promise(
          {
            bool: {
              must: [
                { match_phrase: { district: subcity.name } },
                { term: { doc_type: "project" } },
              ],
            },
          },
          {
            inline: `ctx._source.district = '${subcity.newName}'`,
          }
        );

        //Update Property
        let updatePropertyResultDB = await Property.updateMany(
          {
            district: subcity.name,
          },
          {
            $set: {
              district: subcity.newName,
            },
          }
        );

        console.log("updatePropertyResultDB", updatePropertyResultDB);

        let updatePropertyResult = await Elastic.update_entity_promise(
          {
            bool: {
              must: [
                { match_phrase: { district: subcity.name } },
                { term: { doc_type: "property" } },
              ],
            },
          },
          {
            inline: `ctx._source.district = '${subcity.newName}'`,
          }
        );
      } else {
        console.log("No district found to update with name", subcity.name);
      }
    } catch (error) {
      console.log("Error Updating records", error);
    }
  });
};

const addBoundaries = async (locations) => {
  await asyncForEach(locations, async (loc, index) => {
    try {
      console.log("Processing", loc.id);
      let innerCoordinate = [];
      let geojson = loc.geoJSON.features[0].geometry;

      if (geojson && geojson.type == "Polygon") {
        geojson.coordinates[0].forEach((corodinateObj) => {
          innerCoordinate.push([corodinateObj[1], corodinateObj[0]]);
        });
      }
      let result = await Boundary.updateOne(
        {
          location_type: "subcity",
          id: loc.id,
        },
        {
          $set: {
            boundary: innerCoordinate,
            geoJSON: loc.geoJSON,
          },
        },
        {
          upsert: true,
        }
      );
      console.log("result", result);
    } catch (err) {
      console.log("err", err);
    }
  });
};

let locations = [
  {
    id: "34",
    geoJSON: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [77.27783203125, 28.586632029630984],
                [77.27542877197266, 28.58874229753798],
                [77.2723388671875, 28.589948145896727],
                [77.26959228515625, 28.592058347244052],
                [77.2671890258789, 28.593565607986896],
                [77.26547241210936, 28.5947714010203],
                [77.26409912109375, 28.597484384770684],
                [77.2610092163086, 28.6011015875013],
                [77.25826263427734, 28.603814407841327],
                [77.2562026977539, 28.60652715814121],
                [77.25448608398438, 28.6122538454134],
                [77.25448608398438, 28.61496637778333],
                [77.25173950195312, 28.617980220472187],
                [77.25139617919922, 28.621295347525884],
                [77.25105285644531, 28.62400764635356],
                [77.25105285644531, 28.627021229534375],
                [77.25208282470703, 28.631541442089226],
                [77.25379943847656, 28.634554808973057],
                [77.2562026977539, 28.637266765186347],
                [77.25963592529297, 28.63937601600435],
                [77.2613525390625, 28.64208784760531],
                [77.26238250732422, 28.643895696394896],
                [77.26238250732422, 28.64751130050189],
                [77.26238250732422, 28.648716474174048],
                [77.26203918457031, 28.65203063036226],
                [77.25997924804688, 28.65444085998448],
                [77.25654602050781, 28.6571523020851],
                [77.25345611572266, 28.65835736495444],
                [77.2507095336914, 28.660164933285795],
                [77.24761962890625, 28.661068705763427],
                [77.24384307861328, 28.662574975909973],
                [77.24040985107422, 28.663177477907798],
                [77.23731994628906, 28.66438247151326],
                [77.23388671874999, 28.667093656471632],
                [77.23217010498047, 28.671009688694735],
                [77.23148345947266, 28.674624357770607],
                [77.23114013671875, 28.67703406786973],
                [77.23079681396484, 28.68004612754307],
                [77.22908020019531, 28.683961675624758],
                [77.2287368774414, 28.68757589776321],
                [77.2280502319336, 28.69088882513448],
                [77.22736358642578, 28.69420164767349],
                [77.22736358642578, 28.698116666416993],
                [77.2280502319336, 28.702332676675407],
                [77.2280502319336, 28.705344008582745],
                [77.2280502319336, 28.70715076612776],
                [77.22770690917969, 28.708656373581157],
                [77.22667694091795, 28.710764187613275],
                [77.22667694091795, 28.71196863370574],
                [77.22633361816405, 28.713474171818493],
                [77.22530364990234, 28.716485183031853],
                [77.22427368164062, 28.717990656130986],
                [77.2225570678711, 28.719797195241995],
                [77.21569061279297, 28.72190478475891],
                [77.21122741699217, 28.724313406473463],
                [77.20710754394531, 28.72642090495484],
                [77.20264434814453, 28.727926235000968],
                [77.19818115234375, 28.729130483430154],
                [77.19371795654297, 28.73063577445635],
                [77.18994140625, 28.73183999166862],
                [77.18616485595703, 28.733044195006137],
                [77.18307495117188, 28.734549429666007],
                [77.18238830566406, 28.7312378847968],
                [77.18238830566406, 28.727625170725908],
                [77.18238830566406, 28.724313406473463],
                [77.18238830566406, 28.721302620660314],
                [77.18135833740234, 28.717388469492004],
                [77.1799850463867, 28.713775276840604],
                [77.17826843261719, 28.711366412393062],
                [77.17517852783203, 28.709258610495475],
                [77.1738052368164, 28.70775301170924],
                [77.17105865478516, 28.705344008582745],
                [77.16796875, 28.70353721983789],
                [77.16556549072266, 28.70203153871824],
                [77.1621322631836, 28.701128119647205],
                [77.15801239013672, 28.700224692776988],
                [77.15595245361327, 28.698718963995404],
                [77.15492248535156, 28.695707441442917],
                [77.15320587158203, 28.691792332587482],
                [77.15251922607422, 28.688780610754364],
                [77.1518325805664, 28.686371170911],
                [77.15011596679688, 28.685166430198052],
                [77.14805603027344, 28.683961675624758],
                [77.14427947998047, 28.682154517777473],
                [77.14187622070312, 28.68004612754307],
                [77.13981628417969, 28.67582921974889],
                [77.13912963867188, 28.672214592243147],
                [77.13706970214844, 28.66920230739231],
                [77.13397979736328, 28.66739489491524],
                [77.13054656982422, 28.66347872760795],
                [77.12848663330078, 28.661068705763427],
                [77.12779998779297, 28.65895989119463],
                [77.12539672851561, 28.65654976545602],
                [77.12471008300781, 28.654139584311512],
                [77.12471008300781, 28.651126779970884],
                [77.12574005126953, 28.648113889069094],
                [77.12677001953125, 28.645100911611944],
                [77.12779998779297, 28.642690467330326],
                [77.1291732788086, 28.639677334088283],
                [77.13020324707031, 28.637266765186347],
                [77.13088989257812, 28.63395214251842],
                [77.13260650634764, 28.630938758329496],
                [77.13363647460938, 28.62762393578897],
                [77.135009765625, 28.623404919336203],
                [77.13603973388672, 28.620089858889145],
                [77.13638305664062, 28.616774693775938],
                [77.13638305664062, 28.613158030653977],
                [77.13844299316406, 28.609239838396704],
                [77.14359283447266, 28.606225744900115],
                [77.14668273925781, 28.60502008328845],
                [77.15080261230469, 28.604417247294297],
                [77.15423583984375, 28.603814407841327],
                [77.15801239013672, 28.602307294076848],
                [77.16144561767578, 28.599895867091515],
                [77.16384887695311, 28.597182945589953],
                [77.16556549072266, 28.593867057541985],
                [77.16796875, 28.590551064889592],
                [77.16968536376953, 28.587536435348834],
                [77.17140197753906, 28.58452171937042],
                [77.17414855957031, 28.580903946106915],
                [77.17517852783203, 28.578190534487376],
                [77.17723846435547, 28.575778554282415],
                [77.17792510986328, 28.57306501044475],
                [77.1799850463867, 28.57035139661539],
                [77.1844482421875, 28.569446843119323],
                [77.18891143798828, 28.569145323559233],
                [77.19612121582031, 28.569145323559233],
                [77.20230102539062, 28.56854228184703],
                [77.20745086669922, 28.56854228184703],
                [77.2119140625, 28.56854228184703],
                [77.2177505493164, 28.568240759694916],
                [77.22187042236328, 28.567939236678786],
                [77.22461700439453, 28.567034662446495],
                [77.2283935546875, 28.56582855137444],
                [77.23114013671875, 28.564320893095466],
                [77.23560333251953, 28.564320893095466],
                [77.24006652832031, 28.564019358847855],
                [77.24555969238281, 28.564622426479136],
                [77.24796295166016, 28.564622426479136],
                [77.2507095336914, 28.56552702144653],
                [77.25208282470703, 28.567939236678786],
                [77.25517272949219, 28.571255942335103],
                [77.25723266601562, 28.571858968494595],
                [77.2610092163086, 28.575175550589595],
                [77.26444244384766, 28.57728604839182],
                [77.2671890258789, 28.579999483345077],
                [77.27096557617188, 28.582109884356534],
                [77.27474212646484, 28.584220243018727],
                [77.27783203125, 28.586632029630984],
              ],
            ],
          },
        },
      ],
    },
  },
  {
    id: "1",
    geoJSON: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [77.29740142822266, 28.569145323559233],
                [77.29877471923828, 28.57306501044475],
                [77.29877471923828, 28.575477052868077],
                [77.29911804199219, 28.57879352089678],
                [77.29877471923828, 28.580903946106915],
                [77.30049133300781, 28.582109884356534],
                [77.30220794677734, 28.584823194857766],
                [77.3049545288086, 28.587837902192682],
                [77.30770111083984, 28.58964668510367],
                [77.310791015625, 28.592359801121567],
                [77.31250762939452, 28.594469954058713],
                [77.31319427490234, 28.596881505544648],
                [77.31559753417969, 28.597785823086838],
                [77.31868743896484, 28.59869013284784],
                [77.32246398925781, 28.598388697125415],
                [77.32521057128906, 28.59899156770566],
                [77.32830047607422, 28.6001972984909],
                [77.33139038085938, 28.602005868729954],
                [77.33654022216797, 28.603512986817798],
                [77.33963012695312, 28.60502008328845],
                [77.34134674072266, 28.60652715814121],
                [77.34134674072266, 28.609541242990044],
                [77.34169006347656, 28.613459424004414],
                [77.34169006347656, 28.616774693775938],
                [77.34203338623047, 28.620089858889145],
                [77.34203338623047, 28.6215967175225],
                [77.33928680419922, 28.623404919336203],
                [77.33688354492188, 28.62551444875789],
                [77.33482360839844, 28.62762393578897],
                [77.332763671875, 28.6291306862852],
                [77.33070373535156, 28.63124010064198],
                [77.32761383056639, 28.632746799225856],
                [77.32555389404297, 28.634554808973057],
                [77.32280731201172, 28.636664114307294],
                [77.31937408447266, 28.63847205656025],
                [77.31697082519531, 28.641183911527044],
                [77.31765747070312, 28.645703514027513],
                [77.31903076171875, 28.64931905581678],
                [77.32040405273436, 28.65323575209858],
                [77.32074737548828, 28.655947225364056],
                [77.32109069824219, 28.65865862850741],
                [77.32109069824219, 28.66076744913669],
                [77.3221206665039, 28.664683717749966],
                [77.32280731201172, 28.66679241716207],
                [77.32349395751953, 28.66920230739231],
                [77.32383728027344, 28.672214592243147],
                [77.32418060302734, 28.674624357770607],
                [77.32452392578125, 28.67703406786973],
                [77.32589721679688, 28.6785401085332],
                [77.32830047607422, 28.67884131406748],
                [77.33139038085938, 28.68064852908386],
                [77.33070373535156, 28.684564054643918],
                [77.33070373535156, 28.687274717349613],
                [77.32933044433594, 28.69058765425071],
                [77.32624053955078, 28.69420164767349],
                [77.32452392578125, 28.697213213550476],
                [77.32383728027344, 28.699020111484817],
                [77.32486724853516, 28.701128119647205],
                [77.32521057128906, 28.70383835346197],
                [77.32521057128906, 28.706548517079476],
                [77.32555389404297, 28.708355253823918],
                [77.32658386230469, 28.710463073923208],
                [77.33001708984375, 28.712871959173793],
                [77.3279571533203, 28.71257085155123],
                [77.32486724853516, 28.71257085155123],
                [77.32074737548828, 28.71257085155123],
                [77.31765747070312, 28.713474171818493],
                [77.31388092041016, 28.713173065929563],
                [77.31147766113281, 28.713173065929563],
                [77.30873107910156, 28.713173065929563],
                [77.3056411743164, 28.713775276840604],
                [77.30426788330077, 28.71257085155123],
                [77.30289459228516, 28.71196863370574],
                [77.30049133300781, 28.710161959366403],
                [77.29877471923828, 28.710161959366403],
                [77.29843139648438, 28.708355253823918],
                [77.29808807373047, 28.705946264564464],
                [77.29637145996092, 28.704440618110212],
                [77.29482650756836, 28.70504287929188],
                [77.29328155517578, 28.705344008582745],
                [77.2913932800293, 28.706096828018232],
                [77.28916168212889, 28.70760245063888],
                [77.28899002075195, 28.70850581381088],
                [77.28899002075195, 28.710011401762973],
                [77.28778839111328, 28.710463073923208],
                [77.28778839111328, 28.711366412393062],
                [77.28778839111328, 28.712420297414912],
                [77.28727340698242, 28.713173065929563],
                [77.28710174560547, 28.715130238713098],
                [77.28813171386719, 28.715882987724],
                [77.28950500488281, 28.716334634529975],
                [77.28967666625977, 28.716936827237177],
                [77.28984832763672, 28.71829174815013],
                [77.28984832763672, 28.719646651508096],
                [77.28984832763672, 28.720549910660388],
                [77.29019165039062, 28.721302620660314],
                [77.29053497314453, 28.722055325241694],
                [77.29070663452148, 28.7228080244044],
                [77.28933334350586, 28.723410179833056],
                [77.28847503662108, 28.723711256246897],
                [77.28675842285156, 28.724915553231956],
                [77.28435516357422, 28.726721972698204],
                [77.28195190429688, 28.730033660647283],
                [77.27989196777344, 28.73183999166862],
                [77.27714538574219, 28.734850473996346],
                [77.2733688354492, 28.736656721766202],
                [77.27165222167969, 28.734549429666007],
                [77.266845703125, 28.734549429666007],
                [77.26306915283203, 28.73394733840369],
                [77.26032257080078, 28.73394733840369],
                [77.25791931152342, 28.736656721766202],
                [77.2562026977539, 28.73786086960083],
                [77.25482940673828, 28.74087117847632],
                [77.25482940673828, 28.742978343082275],
                [77.25654602050781, 28.745386479159894],
                [77.25791931152342, 28.747192544786],
                [77.25894927978516, 28.74960058370892],
                [77.25791931152342, 28.752309561131995],
                [77.255859375, 28.75441649498853],
                [77.255859375, 28.75622240445744],
                [77.25242614746094, 28.755620438104973],
                [77.25002288818358, 28.755921421715033],
                [77.24658966064453, 28.75652338633219],
                [77.2452163696289, 28.757125347478777],
                [77.24315643310547, 28.757727305154692],
                [77.24143981933594, 28.758630235160997],
                [77.23869323730469, 28.75923218416008],
                [77.23628997802734, 28.760737041472936],
                [77.23491668701172, 28.758931210094378],
                [77.23320007324219, 28.75652338633219],
                [77.23182678222656, 28.754115507040392],
                [77.23079681396484, 28.752309561131995],
                [77.2280502319336, 28.74869757561903],
                [77.2283935546875, 28.74568749226619],
                [77.22942352294922, 28.743881400616964],
                [77.23217010498047, 28.74177425422592],
                [77.2335433959961, 28.73906500355885],
                [77.23423004150389, 28.736355682639356],
                [77.23560333251953, 28.733345243672538],
                [77.23697662353516, 28.73063577445635],
                [77.2393798828125, 28.728829422623527],
                [77.24109649658203, 28.72702303957455],
                [77.24281311035156, 28.724915553231956],
                [77.24349975585938, 28.721603703143106],
                [77.24246978759764, 28.718893929587658],
                [77.24040985107422, 28.71618408581136],
                [77.23731994628906, 28.713474171818493],
                [77.23491668701172, 28.708957492471686],
                [77.23388671874999, 28.706548517079476],
                [77.23285675048828, 28.70353721983789],
                [77.23079681396484, 28.698718963995404],
                [77.23045349121094, 28.69450280816028],
                [77.23079681396484, 28.689985309884026],
                [77.23182678222656, 28.68667235392349],
                [77.23285675048828, 28.683660484815782],
                [77.23423004150389, 28.6797449254734],
                [77.23560333251953, 28.674624357770607],
                [77.23731994628906, 28.67010600194043],
                [77.2393798828125, 28.667997369204706],
                [77.24178314208983, 28.66649117698661],
                [77.24555969238281, 28.664984963120798],
                [77.25002288818358, 28.663177477907798],
                [77.25276947021484, 28.662574975909973],
                [77.25688934326172, 28.66167121641951],
                [77.26066589355469, 28.659261153016082],
                [77.26306915283203, 28.65654976545602],
                [77.26478576660156, 28.653838307772872],
                [77.2665023803711, 28.649620345339766],
                [77.266845703125, 28.645703514027513],
                [77.26615905761719, 28.643293083593544],
                [77.26444244384766, 28.639677334088283],
                [77.26306915283203, 28.637266765186347],
                [77.26066589355469, 28.63304813634691],
                [77.25929260253906, 28.628226638582973],
                [77.25860595703125, 28.62280218885855],
                [77.25723266601562, 28.618884356412234],
                [77.25757598876952, 28.61496637778333],
                [77.25929260253906, 28.609842646718608],
                [77.2616958618164, 28.604718665723713],
                [77.26444244384766, 28.600498729025663],
                [77.26821899414062, 28.596580064634814],
                [77.27062225341797, 28.594469954058713],
                [77.27474212646484, 28.591756892502065],
                [77.27851867675781, 28.58964668510367],
                [77.28263854980469, 28.587234967640565],
                [77.28607177734375, 28.584823194857766],
                [77.28847503662108, 28.582712848295753],
                [77.28984832763672, 28.579697994029342],
                [77.29087829589844, 28.57728604839182],
                [77.29190826416016, 28.57427103856936],
                [77.29328155517578, 28.572160480278257],
                [77.29740142822266, 28.569145323559233],
              ],
            ],
          },
        },
      ],
    },
  },
  {
    id: "3",
    geoJSON: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [76.95991516113281, 28.688178255991442],
                [76.96678161621094, 28.68757589776321],
                [76.97158813476562, 28.68757589776321],
                [76.98051452636719, 28.68757589776321],
                [76.98944091796875, 28.686973536069704],
                [76.99905395507812, 28.685768802287086],
                [77.01004028320312, 28.684564054643918],
                [77.02102661132812, 28.683961675624758],
                [77.0313262939453, 28.6833592931406],
                [77.04505920410156, 28.68155212489863],
                [77.05535888671874, 28.682154517777473],
                [77.06497192382812, 28.68275690719147],
                [77.07527160644531, 28.682154517777473],
                [77.08694458007812, 28.68155212489863],
                [77.09587097167969, 28.680347328746553],
                [77.10479736328125, 28.677937694866195],
                [77.1185302734375, 28.673720702193144],
                [77.12471008300781, 28.673720702193144],
                [77.13294982910155, 28.67432314011083],
                [77.13844299316406, 28.673720702193144],
                [77.14118957519531, 28.67552800555345],
                [77.14393615722656, 28.679142518735606],
                [77.14805603027344, 28.6833592931406],
                [77.15011596679688, 28.686973536069704],
                [77.15286254882812, 28.689985309884026],
                [77.15629577636717, 28.694803967780636],
                [77.15766906738281, 28.698417815639452],
                [77.16110229492188, 28.700826978223716],
                [77.16590881347656, 28.704440618110212],
                [77.16934204101562, 28.706247391255314],
                [77.17414855957031, 28.708656373581157],
                [77.17758178710938, 28.713474171818493],
                [77.1796417236328, 28.718893929587658],
                [77.18170166015625, 28.726721972698204],
                [77.18170166015625, 28.731538938666308],
                [77.18376159667969, 28.735151517459432],
                [77.18925476074219, 28.736355682639356],
                [77.19474792480469, 28.734549429666007],
                [77.200927734375, 28.731538938666308],
                [77.20573425292969, 28.729130483430154],
                [77.21054077148436, 28.72732410558378],
                [77.21809387207031, 28.723109102552225],
                [77.222900390625, 28.72070045309387],
                [77.2283935546875, 28.718893929587658],
                [77.23320007324219, 28.719496107557465],
                [77.23594665527344, 28.721302620660314],
                [77.23869323730469, 28.726119836344377],
                [77.23663330078125, 28.73093683006015],
                [77.2345733642578, 28.736957760025774],
                [77.23114013671875, 28.74237630038886],
                [77.22976684570312, 28.747192544786],
                [77.2283935546875, 28.75441649498853],
                [77.23526000976562, 28.762843805266026],
                [77.23800659179688, 28.76826100262331],
                [77.23388671874999, 28.774881639746443],
                [77.22496032714844, 28.777890881380014],
                [77.22084045410156, 28.783307297564875],
                [77.21466064453125, 28.785714503359713],
                [77.2064208984375, 28.787519871241077],
                [77.20298767089842, 28.792935787338696],
                [77.20298767089842, 28.801359986481774],
                [77.20504760742188, 28.80978350470993],
                [77.20848083496094, 28.814596637931682],
                [77.21534729003906, 28.818206341896186],
                [77.22015380859375, 28.822417505058908],
                [77.22084045410156, 28.831440852615142],
                [77.2174072265625, 28.838057477044515],
                [77.21122741699217, 28.845275132974518],
                [77.20710754394531, 28.85068804630919],
                [77.20573425292969, 28.856100677938294],
                [77.20161437988281, 28.85970894250466],
                [77.19612121582031, 28.85970894250466],
                [77.18719482421874, 28.85850620156285],
                [77.1796417236328, 28.85790482587427],
                [77.17414855957031, 28.85790482587427],
                [77.16796875, 28.85309369514702],
                [77.16316223144531, 28.845275132974518],
                [77.16110229492188, 28.83865896749593],
                [77.15492248535156, 28.834448461323166],
                [77.14942932128906, 28.834448461323166],
                [77.14256286621094, 28.834448461323166],
                [77.13844299316406, 28.84046341798848],
                [77.13981628417969, 28.847680907010684],
                [77.14530944824219, 28.85309369514702],
                [77.14530944824219, 28.856702064061942],
                [77.14118957519531, 28.86211438264541],
                [77.13569641113281, 28.86512110454975],
                [77.12677001953125, 28.864519767126602],
                [77.11990356445312, 28.860911669532307],
                [77.11509704589844, 28.86391842622456],
                [77.11029052734375, 28.86752641945234],
                [77.10342407226562, 28.869330369098467],
                [77.09518432617188, 28.869330369098467],
                [77.08900451660156, 28.874140748396673],
                [77.08694458007812, 28.87955215891313],
                [77.08076477050781, 28.880153409348612],
                [77.07733154296875, 28.87293817444907],
                [77.07733154296875, 28.868127739480244],
                [77.07321166992188, 28.86752641945234],
                [77.06291198730467, 28.86752641945234],
                [77.05604553222656, 28.86632376895912],
                [77.05329895019531, 28.860911669532307],
                [77.04917907714844, 28.851890877683992],
                [77.04780578613281, 28.844673680771795],
                [77.04505920410156, 28.837455983116197],
                [77.04093933105469, 28.83083932044424],
                [77.03475952148438, 28.832042381309673],
                [77.02720642089844, 28.836854485711072],
                [77.02308654785156, 28.839861937967964],
                [77.01484680175781, 28.839861937967964],
                [77.00523376464844, 28.83865896749593],
                [76.99836730957031, 28.838057477044515],
                [76.9921875, 28.836854485711072],
                [76.98326110839844, 28.829636245673548],
                [76.981201171875, 28.82061274169944],
                [76.97708129882811, 28.82001114696181],
                [76.97227478027344, 28.822417505058908],
                [76.96952819824217, 28.827831607445855],
                [76.9647216796875, 28.825425374477224],
                [76.96197509765625, 28.81640150555238],
                [76.95991516113281, 28.81399500844123],
                [76.95579528808594, 28.813393375475773],
                [76.95098876953125, 28.81700312114226],
                [76.94686889648438, 28.812791739035298],
                [76.94549560546874, 28.803766775462204],
                [76.94412231445312, 28.79534277085327],
                [76.94686889648438, 28.793537538427586],
                [76.94961547851562, 28.792334032776413],
                [76.95373535156249, 28.78872343246379],
                [76.95373535156249, 28.785112707120152],
                [76.9482421875, 28.78210367383126],
                [76.95030212402344, 28.773677918788586],
                [76.95442199707031, 28.77066855563607],
                [76.95648193359375, 28.76765910569123],
                [76.95236206054688, 28.76344572996847],
                [76.94755554199219, 28.75923218416008],
                [76.94549560546874, 28.75501846828201],
                [76.95030212402344, 28.74960058370892],
                [76.95648193359375, 28.74598850450506],
                [76.959228515625, 28.739366034880053],
                [76.96060180664062, 28.731538938666308],
                [76.959228515625, 28.724915553231956],
                [76.95579528808594, 28.719496107557465],
                [76.95098876953125, 28.715882987724],
                [76.94961547851562, 28.71106530043655],
                [76.95304870605469, 28.708054133199937],
                [76.96060180664062, 28.70564513700695],
                [76.9647216796875, 28.704440618110212],
                [76.96815490722656, 28.700224692776988],
                [76.96403503417969, 28.695406284421967],
                [76.95716857910156, 28.69600859759741],
                [76.95510864257812, 28.692394666557494],
                [76.95579528808594, 28.688780610754364],
                [76.95991516113281, 28.688178255991442],
              ],
            ],
          },
        },
      ],
    },
  },
  {
    id: "2",
    geoJSON: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [77.09312438964844, 28.514556057751705],
                [77.09518432617188, 28.517271109348773],
                [77.09793090820312, 28.521192727133563],
                [77.10067749023438, 28.526019133401334],
                [77.10479736328125, 28.53175020383603],
                [77.1075439453125, 28.533559950807494],
                [77.1126937866211, 28.53567128299287],
                [77.11544036865234, 28.539290611171594],
                [77.1181869506836, 28.542909815015516],
                [77.12127685546875, 28.545020959835256],
                [77.12642669677734, 28.548036807604255],
                [77.13088989257812, 28.554068244054378],
                [77.13191986083984, 28.55829004400586],
                [77.13329315185545, 28.56643160863839],
                [77.135009765625, 28.570652912719336],
                [77.13741302490234, 28.57276350125332],
                [77.14084625244139, 28.574572543440226],
                [77.14427947998047, 28.57608005483261],
                [77.14496612548828, 28.57939650384936],
                [77.1456527709961, 28.58331580877781],
                [77.14942932128906, 28.587536435348834],
                [77.15286254882812, 28.589043760924284],
                [77.15663909912108, 28.589948145896727],
                [77.16075897216797, 28.591756892502065],
                [77.16316223144531, 28.592962706283192],
                [77.16522216796875, 28.593565607986896],
                [77.16625213623047, 28.59567573671796],
                [77.16384887695311, 28.598087260538414],
                [77.16178894042969, 28.599895867091515],
                [77.15904235839844, 28.60260871855909],
                [77.15492248535156, 28.60411582800015],
                [77.1511459350586, 28.604718665723713],
                [77.14668273925781, 28.60502008328845],
                [77.14324951171875, 28.606225744900115],
                [77.14084625244139, 28.60833561942784],
                [77.13912963867188, 28.611048252984677],
                [77.13706970214844, 28.613760816489997],
                [77.13706970214844, 28.617980220472187],
                [77.13672637939453, 28.622500822322095],
                [77.13432312011719, 28.626719875109345],
                [77.13226318359375, 28.63033607110889],
                [77.13088989257812, 28.634554808973057],
                [77.1295166015625, 28.63786941260399],
                [77.12814331054688, 28.641183911527044],
                [77.12642669677734, 28.64540221325249],
                [77.12539672851561, 28.64931905581678],
                [77.1240234375, 28.652331912094795],
                [77.12574005126953, 28.65654976545602],
                [77.12848663330078, 28.66076744913669],
                [77.1298599243164, 28.662876227341798],
                [77.13329315185545, 28.664683717749966],
                [77.13672637939453, 28.667997369204706],
                [77.13844299316406, 28.670407231724507],
                [77.13981628417969, 28.672214592243147],
                [77.13878631591797, 28.674624357770607],
                [77.13603973388672, 28.67552800555345],
                [77.13294982910155, 28.67582921974889],
                [77.1295166015625, 28.676130433078256],
                [77.1250534057617, 28.676732857138674],
                [77.11990356445312, 28.67703406786973],
                [77.11509704589844, 28.6776364867335],
                [77.11063385009766, 28.67823890213276],
                [77.10514068603516, 28.679142518735606],
                [77.09964752197266, 28.680347328746553],
                [77.09518432617188, 28.681250927159887],
                [77.09003448486328, 28.68155212489863],
                [77.08248138427734, 28.682154517777473],
                [77.07767486572266, 28.68275690719147],
                [77.07389831542969, 28.6833592931406],
                [77.06840515136719, 28.68305810059914],
                [77.06256866455077, 28.68275690719147],
                [77.05535888671874, 28.68275690719147],
                [77.05020904541016, 28.68275690719147],
                [77.04540252685547, 28.6824557129176],
                [77.04093933105469, 28.6824557129176],
                [77.03475952148438, 28.6824557129176],
                [77.02823638916016, 28.6824557129176],
                [77.02171325683594, 28.683660484815782],
                [77.01622009277342, 28.683660484815782],
                [77.01107025146484, 28.683961675624758],
                [77.00523376464844, 28.684865242854126],
                [76.99905395507812, 28.684865242854126],
                [76.99356079101562, 28.685467616675698],
                [76.98875427246094, 28.68606998703217],
                [76.98257446289062, 28.68667235392349],
                [76.97502136230469, 28.687274717349613],
                [76.97021484375, 28.687877077310503],
                [76.96575164794922, 28.689081786836304],
                [76.96266174316406, 28.688780610754364],
                [76.96025848388672, 28.68757589776321],
                [76.95751190185547, 28.685166430198052],
                [76.95682525634766, 28.680347328746553],
                [76.95613861083984, 28.676130433078256],
                [76.95545196533203, 28.671612142200956],
                [76.95442199707031, 28.6685998400304],
                [76.95201873779297, 28.66920230739231],
                [76.94995880126953, 28.66950353977432],
                [76.94618225097655, 28.66890107414433],
                [76.9430923461914, 28.6685998400304],
                [76.93897247314453, 28.66739489491524],
                [76.93656921386719, 28.66739489491524],
                [76.93416595458984, 28.66528620762573],
                [76.9317626953125, 28.662273723612298],
                [76.93038940429686, 28.659261153016082],
                [76.92695617675781, 28.654742134791775],
                [76.9266128540039, 28.652633192961712],
                [76.92489624023438, 28.648716474174048],
                [76.9266128540039, 28.647210004919998],
                [76.92832946777344, 28.64540221325249],
                [76.93244934082031, 28.64208784760531],
                [76.93553924560547, 28.63937601600435],
                [76.93931579589844, 28.63545880216531],
                [76.9424057006836, 28.63395214251842],
                [76.94446563720703, 28.63244546123956],
                [76.9427490234375, 28.628829337916304],
                [76.94068908691406, 28.62551444875789],
                [76.9382858276367, 28.623404919336203],
                [76.93656921386719, 28.621295347525884],
                [76.93416595458984, 28.618582978630535],
                [76.93107604980469, 28.618884356412234],
                [76.92764282226562, 28.62310355452992],
                [76.92455291748047, 28.626117163663878],
                [76.92146301269531, 28.628829337916304],
                [76.92008972167969, 28.6306374151518],
                [76.91699981689453, 28.63184278267126],
                [76.91253662109375, 28.63124010064198],
                [76.9097900390625, 28.628226638582973],
                [76.90773010253906, 28.62581580664344],
                [76.90670013427733, 28.62430900856464],
                [76.90361022949219, 28.624610369910606],
                [76.90086364746094, 28.62641851981918],
                [76.89777374267578, 28.62852798868222],
                [76.893310546875, 28.6306374151518],
                [76.8881607055664, 28.63124010064198],
                [76.88438415527344, 28.628226638582973],
                [76.8833541870117, 28.622500822322095],
                [76.88163757324219, 28.617076076747438],
                [76.87957763671875, 28.613158030653977],
                [76.8768310546875, 28.608034211375326],
                [76.87305450439453, 28.604417247294297],
                [76.86927795410156, 28.599895867091515],
                [76.86859130859375, 28.593867057541985],
                [76.86653137207031, 28.589043760924284],
                [76.86378479003906, 28.586029088163958],
                [76.85897827148438, 28.58452171937042],
                [76.85279846191406, 28.584220243018727],
                [76.84730529785156, 28.582712848295753],
                [76.84284210205078, 28.58241136675828],
                [76.83975219726562, 28.580903946106915],
                [76.83975219726562, 28.575778554282415],
                [76.83975219726562, 28.571255942335103],
                [76.84043884277344, 28.56643160863839],
                [76.84181213378906, 28.562511674651255],
                [76.84181213378906, 28.55798849248102],
                [76.84181213378906, 28.55467136869822],
                [76.8435287475586, 28.55044942364006],
                [76.84730529785156, 28.547735226713506],
                [76.85142517089844, 28.546830478859622],
                [76.85691833496094, 28.54652889451448],
                [76.86241149902344, 28.545624136297636],
                [76.8655014038086, 28.54079862788394],
                [76.86790466308592, 28.53597289842307],
                [76.8709945678711, 28.53235345627975],
                [76.87442779541016, 28.52813061665919],
                [76.87889099121094, 28.523605957887614],
                [76.88404083251953, 28.52089106940537],
                [76.88678741455078, 28.51908110491183],
                [76.88472747802734, 28.51515940859189],
                [76.8833541870117, 28.51244430262838],
                [76.8826675415039, 28.510332505222408],
                [76.88232421875, 28.507013881018153],
                [76.88129425048828, 28.50369515241441],
                [76.8833541870117, 28.502186604902597],
                [76.88644409179688, 28.501281466042947],
                [76.88919067382812, 28.500979751364326],
                [76.89228057861328, 28.500979751364326],
                [76.8936538696289, 28.50369515241441],
                [76.89571380615234, 28.506410483582485],
                [76.89880371093749, 28.508824052617584],
                [76.90155029296875, 28.50912574486426],
                [76.9039535522461, 28.509729126769052],
                [76.90670013427733, 28.51244430262838],
                [76.91082000732422, 28.511539251774604],
                [76.91425323486327, 28.510935880224274],
                [76.91768646240234, 28.50912574486426],
                [76.9211196899414, 28.507013881018153],
                [76.92420959472656, 28.506410483582485],
                [76.92764282226562, 28.509729126769052],
                [76.92935943603516, 28.511539251774604],
                [76.93347930908203, 28.510332505222408],
                [76.93656921386719, 28.50912574486426],
                [76.93897247314453, 28.507315578441784],
                [76.9430923461914, 28.504901974894562],
                [76.9478988647461, 28.50369515241441],
                [76.95304870605469, 28.504600270568645],
                [76.9588851928711, 28.506410483582485],
                [76.96163177490233, 28.50822066553574],
                [76.9650650024414, 28.510634193154775],
                [76.9698715209961, 28.513349345715955],
                [76.97227478027344, 28.51485773360326],
                [76.97467803955078, 28.51696944040106],
                [76.9767379760742, 28.51847777650959],
                [76.97845458984375, 28.5205894108141],
                [76.9808578491211, 28.51908110491183],
                [76.98326110839844, 28.516667770590317],
                [76.9863510131836, 28.515762755980184],
                [76.98978424072266, 28.514556057751705],
                [76.99493408203125, 28.516366099916606],
                [76.99699401855469, 28.51877944114221],
                [77.00145721435547, 28.51757277743349],
                [77.00557708740234, 28.515461082717522],
                [77.00935363769531, 28.51485773360326],
                [77.01313018798828, 28.516667770590317],
                [77.01519012451172, 28.519986091042362],
                [77.01553344726562, 28.523605957887614],
                [77.01244354248047, 28.525415844701858],
                [77.00935363769531, 28.526622418648127],
                [77.00660705566406, 28.52813061665919],
                [77.0028305053711, 28.530242057619308],
                [76.99974060058594, 28.532051830489543],
                [77.00008392333983, 28.53506804954235],
                [77.00180053710938, 28.53597289842307],
                [77.00523376464844, 28.53868739844257],
                [77.00935363769531, 28.538385790782893],
                [77.01347351074219, 28.538989005238783],
                [77.01828002929688, 28.536877739533463],
                [77.02308654785156, 28.533861572281154],
                [77.02686309814453, 28.53144857631924],
                [77.0306396484375, 28.529337159530115],
                [77.03544616699219, 28.528432253671745],
                [77.04093933105469, 28.526019133401334],
                [77.04402923583984, 28.523304307064226],
                [77.04643249511719, 28.521494383998657],
                [77.04677581787108, 28.518176111013897],
                [77.04711914062499, 28.515461082717522],
                [77.0526123046875, 28.51515940859189],
                [77.0584487915039, 28.513651025019303],
                [77.06222534179688, 28.513349345715955],
                [77.06703186035156, 28.513349345715955],
                [77.07012176513672, 28.516366099916606],
                [77.07183837890625, 28.51908110491183],
                [77.07355499267578, 28.519986091042362],
                [77.07698822021484, 28.51877944114221],
                [77.07939147949219, 28.517874444655206],
                [77.08316802978516, 28.516667770590317],
                [77.08797454833984, 28.515461082717522],
                [77.09312438964844, 28.514556057751705],
              ],
            ],
          },
        },
      ],
    },
  },
  {
    id: "4",
    geoJSON: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [77.27783203125, 28.58693349906797],
                [77.27508544921875, 28.58452171937042],
                [77.27371215820312, 28.58241136675828],
                [77.27096557617188, 28.580602459383865],
                [77.26821899414062, 28.57879352089678],
                [77.26444244384766, 28.57728604839182],
                [77.26032257080078, 28.57487404744697],
                [77.2562026977539, 28.571858968494595],
                [77.25173950195312, 28.56854228184703],
                [77.24967956542967, 28.567637712798664],
                [77.24693298339844, 28.567034662446495],
                [77.24143981933594, 28.56552702144653],
                [77.23628997802734, 28.56552702144653],
                [77.23148345947266, 28.566130080438384],
                [77.22667694091795, 28.567939236678786],
                [77.222900390625, 28.569446843119323],
                [77.21912384033203, 28.57035139661539],
                [77.21431732177734, 28.57035139661539],
                [77.20985412597656, 28.570652912719336],
                [77.20573425292969, 28.57035139661539],
                [77.19989776611328, 28.57035139661539],
                [77.19440460205078, 28.57035139661539],
                [77.19165802001953, 28.570049879647403],
                [77.18788146972655, 28.57035139661539],
                [77.18376159667969, 28.571557455846897],
                [77.18135833740234, 28.57276350125332],
                [77.1796417236328, 28.575175550589595],
                [77.17689514160156, 28.578492028124163],
                [77.17552185058594, 28.581205431965696],
                [77.1734619140625, 28.584220243018727],
                [77.17071533203125, 28.587536435348834],
                [77.1683120727539, 28.590852523089378],
                [77.16796875, 28.592359801121567],
                [77.16659545898438, 28.594469954058713],
                [77.16487884521484, 28.5941685062326],
                [77.1628189086914, 28.593565607986896],
                [77.15938568115234, 28.591455436895625],
                [77.15457916259766, 28.589948145896727],
                [77.1518325805664, 28.58874229753798],
                [77.14908599853516, 28.587536435348834],
                [77.14599609375, 28.585727616133926],
                [77.14462280273438, 28.582109884356534],
                [77.14393615722656, 28.57879352089678],
                [77.14187622070312, 28.575778554282415],
                [77.13775634765625, 28.574572543440226],
                [77.135009765625, 28.571858968494595],
                [77.13432312011719, 28.56854228184703],
                [77.13363647460938, 28.564320893095466],
                [77.13363647460938, 28.55979778867285],
                [77.13088989257812, 28.553766680436862],
                [77.12848663330078, 28.549846274812907],
                [77.12299346923828, 28.54622730930576],
                [77.12059020996094, 28.544116188665107],
                [77.11647033691406, 28.541100228636036],
                [77.11544036865234, 28.537480962623437],
                [77.11200714111328, 28.53567128299287],
                [77.10823059082031, 28.533258328470527],
                [77.10479736328125, 28.531146947939167],
                [77.10136413574217, 28.526622418648127],
                [77.09896087646484, 28.522399349415434],
                [77.09724426269531, 28.519382767818374],
                [77.09484100341797, 28.516667770590317],
                [77.09312438964844, 28.51304766554969],
                [77.09415435791014, 28.510030816427165],
                [77.09587097167969, 28.506712182731704],
                [77.09793090820312, 28.50580708269566],
                [77.10067749023438, 28.503091735997877],
                [77.10685729980469, 28.500376319419054],
                [77.11097717285156, 28.49856600287915],
                [77.11441040039062, 28.497660832963472],
                [77.11784362792969, 28.497359107932986],
                [77.12059020996094, 28.496453927665872],
                [77.11956024169922, 28.493436604040774],
                [77.1181869506836, 28.487401698034464],
                [77.11612701416016, 28.483177058570757],
                [77.11406707763672, 28.47774513090883],
                [77.1126937866211, 28.473821898299914],
                [77.11063385009766, 28.470502126133404],
                [77.11200714111328, 28.46778587131769],
                [77.11475372314453, 28.464465909496944],
                [77.11784362792969, 28.462654977269974],
                [77.12059020996094, 28.459334854263627],
                [77.12196350097656, 28.455410938077357],
                [77.12230682373047, 28.45239244190383],
                [77.12265014648438, 28.447864536069808],
                [77.1250534057617, 28.44454394857482],
                [77.12814331054688, 28.4433364363651],
                [77.13088989257812, 28.441223256828355],
                [77.13294982910155, 28.439411926483288],
                [77.13706970214844, 28.43760056512489],
                [77.1401596069336, 28.436091073636405],
                [77.14290618896484, 28.436694872816105],
                [77.14668273925781, 28.437902460838288],
                [77.15011596679688, 28.43578917275445],
                [77.15251922607422, 28.433675842461472],
                [77.15560913085938, 28.432166294982455],
                [77.15972900390625, 28.429750974226664],
                [77.16316223144531, 28.4282413707621],
                [77.16556549072266, 28.425222099239033],
                [77.16556549072266, 28.42250468123521],
                [77.16556549072266, 28.418881348726007],
                [77.16590881347656, 28.4161637679716],
                [77.16796875, 28.412540218477243],
                [77.17071533203125, 28.409822474995764],
                [77.17174530029295, 28.407406644470846],
                [77.17449188232422, 28.40499075885129],
                [77.17723846435547, 28.40650069381975],
                [77.1799850463867, 28.408312587374258],
                [77.18341827392578, 28.408916545005503],
                [77.18685150146484, 28.40770862629952],
                [77.19131469726562, 28.407406644470846],
                [77.19474792480469, 28.408010607267308],
                [77.19818115234375, 28.408010607267308],
                [77.2012710571289, 28.40770862629952],
                [77.20436096191406, 28.408312587374258],
                [77.20745086669922, 28.408916545005503],
                [77.2122573852539, 28.409520499193246],
                [77.2174072265625, 28.41042642401811],
                [77.21981048583984, 28.41133234109476],
                [77.22358703613281, 28.412540218477243],
                [77.2280502319336, 28.41344611747412],
                [77.23285675048828, 28.41525789222145],
                [77.23560333251953, 28.41767354366791],
                [77.23697662353516, 28.419787193478268],
                [77.24075317382812, 28.420994974425927],
                [77.24281311035156, 28.421598859733034],
                [77.24624633789062, 28.422806620013656],
                [77.24933624267578, 28.425222099239033],
                [77.25139617919922, 28.4282413707621],
                [77.25242614746094, 28.431260556158897],
                [77.25208282470703, 28.433373934688372],
                [77.24796295166016, 28.432770116558117],
                [77.24796295166016, 28.434279655423556],
                [77.24796295166016, 28.437298668550063],
                [77.24796295166016, 28.440921370591276],
                [77.24796295166016, 28.443638315709894],
                [77.24796295166016, 28.445449573685508],
                [77.24658966064453, 28.448166402490504],
                [77.24624633789062, 28.450883161501586],
                [77.2452163696289, 28.452996148032607],
                [77.244873046875, 28.455109092337974],
                [77.24212646484374, 28.455712782954933],
                [77.2397232055664, 28.455109092337974],
                [77.23594665527344, 28.454807245736816],
                [77.2335433959961, 28.45601462697071],
                [77.23285675048828, 28.458127510950163],
                [77.23251342773438, 28.461447671879817],
                [77.23285675048828, 28.464164089614023],
                [77.23285675048828, 28.46778587131769],
                [77.23491668701172, 28.471709328081822],
                [77.23766326904297, 28.47502906231439],
                [77.24178314208983, 28.477443348958296],
                [77.24624633789062, 28.4795558045049],
                [77.2503662109375, 28.481064675455944],
                [77.25448608398438, 28.482573524849567],
                [77.25791931152342, 28.483780588842595],
                [77.26203918457031, 28.485289399430933],
                [77.26581573486327, 28.48589291762964],
                [77.26924896240234, 28.487099943678324],
                [77.27165222167969, 28.487099943678324],
                [77.2723388671875, 28.489212206060223],
                [77.2723388671875, 28.491626168463423],
                [77.27542877197266, 28.492833128965096],
                [77.27920532226562, 28.494040075666316],
                [77.28401184082031, 28.495850469841447],
                [77.28847503662108, 28.496453927665872],
                [77.29259490966797, 28.49615219918497],
                [77.29568481445312, 28.495247008566704],
                [77.29877471923828, 28.494945276635455],
                [77.30083465576172, 28.493436604040774],
                [77.30117797851562, 28.489815701835894],
                [77.30426788330077, 28.489815701835894],
                [77.30701446533203, 28.488608706834743],
                [77.30941772460938, 28.48770345152817],
                [77.31147766113281, 28.485591158961483],
                [77.31422424316406, 28.484384115665033],
                [77.3162841796875, 28.4846858777827],
                [77.31800079345703, 28.48589291762964],
                [77.31971740722655, 28.487401698034464],
                [77.32280731201172, 28.488910456878717],
                [77.32589721679688, 28.491626168463423],
                [77.32830047607422, 28.494040075666316],
                [77.33036041259766, 28.49705738203991],
                [77.3324203491211, 28.500074602152377],
                [77.33448028564453, 28.502790026495518],
                [77.33654022216797, 28.505505380958056],
                [77.33894348144531, 28.507918970700576],
                [77.34066009521484, 28.510935880224274],
                [77.34374999999999, 28.513952703459726],
                [77.34615325927734, 28.517271109348773],
                [77.34649658203125, 28.5205894108141],
                [77.34512329101562, 28.521494383998657],
                [77.34134674072266, 28.522399349415434],
                [77.33482360839844, 28.52390760784785],
                [77.33207702636719, 28.526622418648127],
                [77.32933044433594, 28.530543688589216],
                [77.3269271850586, 28.532956705270255],
                [77.32486724853516, 28.534766431522083],
                [77.32246398925781, 28.53778257287333],
                [77.31868743896484, 28.539592216240948],
                [77.31422424316406, 28.542909815015516],
                [77.31010437011719, 28.545020959835256],
                [77.3052978515625, 28.54863996679498],
                [77.30220794677734, 28.552861984402025],
                [77.29911804199219, 28.556480721899916],
                [77.29705810546874, 28.56009933501476],
                [77.29499816894531, 28.564019358847855],
                [77.29328155517578, 28.566733135974424],
                [77.29053497314453, 28.569446843119323],
                [77.28950500488281, 28.572160480278257],
                [77.28710174560547, 28.575477052868077],
                [77.28607177734375, 28.578492028124163],
                [77.28401184082031, 28.58150691696023],
                [77.28057861328125, 28.58452171937042],
                [77.27783203125, 28.58693349906797],
              ],
            ],
          },
        },
      ],
    },
  },
];

// addBoundaries(locations)

// //Update events
// updateProjectName([{
//     name: "Bluejay Aster Villa Plots",
//     newName: "Bluejay Aster Plots"
// },{name: "Bluejay Ardley Villa Plots",
// newName: "Bluejay Ardley"}
// ,{name: "prestige Jindal City",
// newName: "Prestige Jindal City"}
// ,{name: "Chartered Grasshapper",
// newName: "Chartered Grasshopper"}
// ,{name: "Chartered Veda Plots",
// newName: "Chartered Veda"}
// ,{name: "Hiranandani Gardens,Atlantis",
// newName: "Hiranandani Atlantis"}
// ,{name: "RIVALI PARK WINTERGREEN",
// newName: "Rivali Park Wintergreen"}
// ,{name: "Tulip Lemon",
// newName: "Tulip Lemon Affordable"}
// ,{name: "Andour Heights",
// newName: "Andour Heights Affordable"}
// ,{name: "ROF Aalayas",
// newName: "ROF Aalayas Affordable"}
// ,{name: "Urban Homes",
// newName: "Urban Homes Affordable"}
// ,{name: "Solera",
// newName: "Solera Affordable"}
// ,{name: "Suncity Avenue 102",
// newName: "Suncity Avenue 102 Affordable"}
// ,{name: "MEERUT ONE (RESIDENTIAL GROUP HOUSING)",
// newName: "Meerut One Apartments"}
// ,{name: "Meerut One",
// newName: "Meerut One Plots"}])

// updateBuilderName([{
//     name: "Century real estate",
//     newName: "Holdings Pvt. Ltd"
// }, {
//     name: "Chaitanya Group",
//     newName: "Chaithanya Projects Pvt. Ltd."
// }, {
//     name: "Paras Group",
//     newName: "Paras Buildtech India Pvt. Ltd."
// }, {
//   name: "Ansal Housing",
//   newName: "Ansal Housing Limited"
// }, {
//   name: "Gulshan",
//   newName: "Gulshan Group"
// }])

// updateDistrictName([{
//   name: "Gurgaon",
//   newName: "Gurugram"
// }])

// updateSubCityName([{
//     name: "Sohna Road",
//     newName: "Sohna Road and SPR"
// }])

// updateAuthorityName([{
//         name: "Delhi Development Authority (DDA)",
//         newName: "Monu Development Authority (MDA)"
//     }
// ])

// Elastic.delete_entity_promise({ match_phrase: { doc_type: "location" } });
