const express = require("express");
const supabase = require("../config/supabase");

const router = express.Router();

router.get("/supabase", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("sites")
            .select("*")
            .limit(1);

        if (error) {
            return res.status(500).json({
                status: "error",
                message: "Supabase connection failed",
                error: error.message
            });
        }

        res.json({
            status: "success",
            message: "Supabase connection is working",
            data: data
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Could not connect to Supabase",
            error: error.message
        });
    }
});

module.exports = router;