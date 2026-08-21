const supabase = require("../config/supabase");





// register 
const register = async (req, res) => {
    try {
        let {
            fullName,
            pmcUserId,
            email,
            password
        } = req.body;

        // Check required fields
        if (!fullName || !pmcUserId || !email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Full name, PMC User ID, email and password are required"
            });
        }

        // Clean input
        fullName = fullName.trim();
        pmcUserId = pmcUserId.trim();
        email = email.trim().toLowerCase();

        // Password validation
        if (password.length < 6) {
            return res.status(400).json({
                status: "error",
                message: "Password must be at least 6 characters"
            });
        }

        // 1. Create user in Supabase Authentication
        const { data: authData, error: authError } =
            await supabase.auth.signUp({
                email,
                password
            });

        if (authError) {
            return res.status(400).json({
                status: "error",
                message: authError.message
            });
        }

        // Check whether Supabase created the user
        if (!authData.user) {
            return res.status(400).json({
                status: "error",
                message: "User registration failed"
            });
        }

        // 2. Create profile
        const { data: profile, error: profileError } =
            await supabase
                .from("profiles")
                .insert([
                    {
                        user_id: authData.user.id,
                        full_name: fullName,
                        pmc_user_id: pmcUserId
                    }
                ])
                .select()
                .single();

        // If profile creation fails
        if (profileError) {
            return res.status(400).json({
                status: "error",
                message: "Profile creation failed",
                error: profileError.message
            });
        }

        // Successful registration
        res.status(201).json({
            status: "success",
            message: "Registration successful",
            user: {
                id: authData.user.id,
                email: authData.user.email
            },
            profile
        });

    } catch (error) {

        console.error("Registration error:", error);

        res.status(500).json({
            status: "error",
            message: "Server error"
        });
    }
};

//Login
const login = async (req, res) => {
    try {
        let { userId, password } = req.body;

        // Check required fields
        if (!userId || !password) {
            return res.status(400).json({
                status: "error",
                message: "PMC User ID and password are required"
            });
        }

        userId = userId.trim();

        // Find the user's profile using PMC User ID
        const { data: profile, error: profileError } =
            await supabase
                .from("profiles")
                .select("user_id, full_name, pmc_user_id")
                .eq("pmc_user_id", userId)
                .single();

        if (profileError || !profile) {
            return res.status(401).json({
                status: "error",
                message: "Invalid PMC User ID or password"
            });
        }

        // Get email from Supabase Auth user
        const { data: authUser, error: authError } =
            await supabase.auth.admin.getUserById(profile.user_id);

        if (authError || !authUser.user) {
            return res.status(401).json({
                status: "error",
                message: "Unable to find user account"
            });
        }

        const email = authUser.user.email;

        // Login using email + password internally
        const { data, error } =
            await supabase.auth.signInWithPassword({
                email,
                password
            });

        if (error) {
            return res.status(401).json({
                status: "error",
                message: "Invalid PMC User ID or password"
            });
        }

        // Successful login
        res.status(200).json({
            status: "success",
            message: "Login successful",

            user: {
                id: data.user.id,
                email: data.user.email,
                fullName: profile.full_name,
                pmcUserId: profile.pmc_user_id
            },

            session: data.session
        });

    } catch (error) {

        console.error("Login error:", error);

        res.status(500).json({
            status: "error",
            message: "Server error"
        });
    }
};

//logout 
const logout = async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.message
            });
        }

        res.status(200).json({
            status: "success",
            message: "Logout successful"
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Server error"
        });
    }
};

//Get user 
const getCurrentUser = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                status: "error",
                message: "Authorization token is required"
            });
        }

        const token = authHeader.split(" ")[1];

        const { data, error } = await supabase.auth.getUser(token);

        if (error) {
            return res.status(401).json({
                status: "error",
                message: "Invalid or expired token"
            });
        }

        res.status(200).json({
            status: "success",
            user: data.user
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Server error"
        });
    }
};

//forgot password 

const forgotPassword = async (req, res) => {
    try {
        let { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: "error",
                message: "Email is required"
            });
        }

        email = email.trim().toLowerCase();

        const { error } = await supabase.auth.resetPasswordForEmail(
            email,
            {
                redirectTo: "http://localhost:5173/reset-password"
            }
        );

        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.message
            });
        }

        res.status(200).json({
            status: "success",
            message: "If the email exists, a password reset link has been sent."
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Server error"
        });
    }
};



module.exports = {
    register,
    login,
    logout,
    getCurrentUser,
    forgotPassword
};