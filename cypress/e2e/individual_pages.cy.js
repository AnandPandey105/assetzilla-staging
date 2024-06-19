import axios from "axios";
describe("Test URLs from MongoDB", () => {
  let entities;
  before(async () => {
    let url = "http://localhost:5100/api/property/get";
    entities = await cy.request("post", url, {
      filter: {},
      limit: 1000,
      sort: "newest",
      user: "tejas@teson.in",
    });
    // cy.task('log', Object.keys(entities.body));
    entities = entities.body.results;
    // cy.task('log', entities);
  });
  it("should test all URLs from MongoDB", () => {
    entities?.forEach((entity) => {
      // if (entity.price && !entity.price.price) {
      cy.viewport(1920, 1080);
      cy.task("log", entity.url);
      cy.visit(entity.url);
      cy.get("#collapsefive").should("not.exist");
      // }
    });
  });
});
