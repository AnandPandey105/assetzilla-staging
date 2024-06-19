describe("Open Listing Pages", () => {
  it("Opens property listing page", () => {
    cy.viewport(1920, 1080);
    cy.visit("/properties");
  });
  it("Opens project listing page", () => {
    cy.viewport(1920, 1080);
    cy.visit("/projects");
  });
  it("Opens location listing page", () => {
    cy.viewport(1920, 1080);
    cy.visit("/locations");
  });
  it("Opens builder listing page", () => {
    cy.viewport(1920, 1080);
    cy.visit("/builders");
  });
  it("Opens authority listing page", () => {
    cy.viewport(1920, 1080);
    cy.visit("/authorities");
  });
  it("Opens bank listing page", () => {
    cy.viewport(1920, 1080);
    cy.visit("/banks");
  });
  it("news or blogs page", () => {
    cy.viewport(1920, 1080);
    cy.visit("/news");
  });
  it("individual Tags page", () => {
    cy.viewport(1920, 1080);
    cy.visit("/news/tags/Delhi");
  });
});

describe("Open non entity pages", () => {
  it("index page", () => {
    cy.viewport(1920, 1080);
    cy.visit("/");
  });

  it("sell your property page", () => {
    cy.viewport(1920, 1080);
    cy.visit("/sellyourproperty");
  });
  it("about page", () => {
    cy.viewport(1920, 1080);
    cy.visit("/about");
  });
  it("faq page", () => {
    cy.viewport(1920, 1080);
    cy.visit("/faq");
  });
  it("privacy-policy page", () => {
    cy.viewport(1920, 1080);
    cy.visit("/privacy-policy");
  });
  it("terms-of-use page", () => {
    cy.viewport(1920, 1080);
    cy.visit("/terms-of-use");
  });
});
