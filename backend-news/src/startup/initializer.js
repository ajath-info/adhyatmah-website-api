const Settings = require("../models/Settings");
const Currency = require("../models/Currencies");
const Language = require("../models/Language");
const fs = require("fs");
const path = require("path");

const initializeDefaults = async () => {
  try {
    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      const defaultSettings = JSON.parse(
        fs.readFileSync(
          path.join(__dirname, "../config/settings.json"),
          "utf-8"
        )
      );
      await Settings.create(defaultSettings);
      console.log("✅ Default Settings initialized.");
    }

    const currencyCount = await Currency.countDocuments();
    if (currencyCount === 0) {
      const defaultCurrencies = JSON.parse(
        fs.readFileSync(
          path.join(__dirname, "../config/currencies.json"),
          "utf-8"
        )
      );
      await Currency.insertMany(defaultCurrencies);
      console.log("✅ Default Currencies initialized.");
    }

    const languageCount = await Language.countDocuments();
    if (languageCount === 0) {
      const defaultLanguages = JSON.parse(
        fs.readFileSync(
          path.join(__dirname, "../constants/languages.json"),
          "utf-8"
        )
      );
      await Language.insertMany(defaultLanguages);
      console.log("✅ Default Languages initialized.");
    }
  } catch (error) {
    console.error("❌ Error initializing defaults:", error.message);
  }
};

module.exports = initializeDefaults;