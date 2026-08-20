const express = require("express");
const router = express.Router();
const language = require("../../controllers/admin/language-controller");
const verifyToken = require("../../middlewares/jwt-middleware");
const { getAdmin } = require("../../middlewares/getAdmin-middleware");

router.get(
    "/admin/languages",
    verifyToken,
    getAdmin,
    language.getAdminLanguages
);
router.get(
    "/admin/languages/:lid",
    verifyToken,
    getAdmin,
    language.getLanguage
);

router.post(
    "/admin/languages",
    verifyToken,
    getAdmin,
    language.createLanguage
);

router.put(
    "/admin/languages/:lid",
    verifyToken,
    getAdmin,
    language.updateLanguage
);

router.delete(
    "/admin/languages/:lid",
    verifyToken,
    getAdmin,
    language.deleteLanguage
);

module.exports = router;