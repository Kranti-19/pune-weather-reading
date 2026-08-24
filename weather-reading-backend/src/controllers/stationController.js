const supabase = require("../config/supabase");

const getStations = async (req, res) => {

    try {

        const { data, error } = await supabase
            .from("station")
            .select(`
                station_id,
                name,
                ward,
                zone,
                status
            `)
            .order("station_id", {
                ascending: true
            });


        if (error) {

            console.error(
                "Get stations error:",
                error
            );

            return res.status(500).json({
                status: "error",
                message: error.message
            });

        }


        return res.status(200).json({

            status: "success",

            stations: data

        });


    } catch (error) {

        console.error(
            "Station server error:",
            error
        );


        return res.status(500).json({

            status: "error",

            message: "Server error"

        });

    }

};


module.exports = {
    getStations
};