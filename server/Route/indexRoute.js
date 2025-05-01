const express = require("express");

const router = express.Router();

const { homePage, aboutPage, contactPage, transportPage, freightPage, oceanPage, warehousePage, productPage, systemsPage, industryPage, defensePage, automotivePage, gasPage, healthcarePage, consumerPage, casePage, quotePage, trackPage, spacePage, logisticPage, rocketPage, clientsPage, estimationPage, shipsPage, budgetPage, distributionPage, systemPage, controlledPage, temperaturePage, fbaPage, fbadeliveryPage, logisticsPage, securityPage, aeroNotPage, autoNotPage, gasNotPage, faNotPage, healthnotPage, consumerNotPage, blogPage, costPage, centerPage, partsPage, servicesPage} = require("../controllers/userController");
// const { loginAdmin_post } = require("../controllers/adminController");

router.get("/", homePage);
router.get("/about", aboutPage);
router.get("/contact", contactPage);
router.get("/services", servicesPage);
router.get("/land-transport", transportPage);
router.get("/air-freight", freightPage);
router.get("/ocean-freight", oceanPage);
router.get("/smart-warehouse", warehousePage);
router.get("/special-product", productPage);
router.get("/systems-technologies",systemsPage);
router.get("/industry-solutions", industryPage);
router.get("/aerospace-defense", defensePage);
router.get("/automotive", automotivePage);
router.get("/oil-gas", gasPage);
router.get("/healthcare", healthcarePage);
router.get("/consumer", consumerPage);
router.get("/case", casePage);
router.get("/track-form", trackPage);
router.get("/get-a-quote", quotePage);
router.get("/transport-of-spacex-rocket",spacePage);
router.get("/rocket",rocketPage);
router.get("/logistic", logisticPage);
router.get("/ocean-saving-to-clients",clientsPage);
router.get("/ocean", oceanPage);
router.get("/ships", shipsPage);
router.get("/project-cost-estimation", estimationPage);
router.get("/budget", budgetPage);
router.get("/cost", costPage);

router.get("/region-distribution-center", centerPage);
router.get("/distribution", distributionPage);
router.get("/system", systemPage);
router.get("/international-temperature-controlled", controlledPage);
router.get("/temperature", temperaturePage);
router.get("/transport", transportPage);
router.get("/fba-delivery-service", fbadeliveryPage);
router.get("/fba", fbaPage);
router.get("/logistics", logisticsPage);
router.get("/after-service-parts", partsPage);
router.get("/security", securityPage);
router.get("/industry-solutions/aerospace-defense", aeroNotPage);
router.get("/industry-solutions/automotive", autoNotPage);
router.get("/industry-solutions/oil-gas", gasNotPage);
router.get("/industry-solutions/retail-fashion",faNotPage);
router.get("/industry-solutions/healthcare", healthnotPage);
router.get("/industry-solutions/consumer", consumerNotPage);
router.get("/blog-full-right-sidebar-with-frame", blogPage);
// router.get("/system", systemPage);
// router.get("/system", systemPage);






module.exports = router;