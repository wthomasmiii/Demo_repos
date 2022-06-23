const router = require('express').Router();
const simulatorInformationController = require('../../../../controllers/simulatorInformation');

const { protect, authorize, orgVerify } = require("../../../../middleware/auth");

router.get('/:userId/:SIID', simulatorInformationController.getUserSimulationInformation)
router.patch('/trailer/updateTrailer', simulatorInformationController.patchTrailerObject);

/**
 * @method GET /api/v1/simulatorInformation
 * @description Get my simulator information
 * @access Public | Auth
 */
router.use(protect).get('/', simulatorInformationController.getMySimulatorInformation);

/**
 * @method GET /api/v1/categories/search?categoryId=[string]
 * @description Gets a collection of articles by 1 or more categories
 * @access Public | Auth
 */

router.use(protect).patch('/:Type', simulatorInformationController.patchTruckObject);

module.exports = router;
