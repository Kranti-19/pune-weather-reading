const supabase = require("../config/supabase");

// ============================================================
// REGISTER
// ============================================================

const register = async (req, res) => {
    try {
        let {
            fullName,
            pmcUserId,
            email,
            password,
        } = req.body;

        // ------------------------------------------------------
        // Check required fields
        // ------------------------------------------------------

        if (
            !fullName ||
            !pmcUserId ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                status: "error",
                message:
                    "Full name, PMC User ID, email and password are required",
            });
        }

        // ------------------------------------------------------
        // Clean input
        // ------------------------------------------------------

        fullName = fullName.trim();
        pmcUserId = pmcUserId.trim();
        email = email.trim().toLowerCase();

        // ------------------------------------------------------
        // Password validation
        // ------------------------------------------------------

        if (password.length < 6) {
            return res.status(400).json({
                status: "error",
                message:
                    "Password must be at least 6 characters",
            });
        }

        // ======================================================
        // 1. CREATE USER IN SUPABASE AUTH
        // ======================================================

        const {
            data: authData,
            error: authError,
        } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) {
            return res.status(400).json({
                status: "error",
                message: authError.message,
            });
        }

        if (!authData.user) {
            return res.status(400).json({
                status: "error",
                message:
                    "User registration failed",
            });
        }

        // ======================================================
        // 2. CREATE PROFILE
        // ======================================================

        /*
         * IMPORTANT:
         *
         * New registrations ALWAYS get role = "user".
         *
         * Do NOT accept role from req.body.
         *
         * This prevents someone from sending:
         *
         * {
         *   role: "admin"
         * }
         *
         * during registration.
         */

        const {
            data: profile,
            error: profileError,
        } = await supabase
            .from("profiles")
            .insert([
                {
                    user_id:
                        authData.user.id,

                    full_name:
                        fullName,

                    pmc_user_id:
                        pmcUserId,

                    role: "user",
                },
            ])
            .select()
            .single();

        // ------------------------------------------------------
        // Profile creation failed
        // ------------------------------------------------------

        if (profileError) {
            console.error(
                "Profile creation error:",
                profileError
            );

            return res.status(400).json({
                status: "error",
                message:
                    "Profile creation failed",
                error:
                    profileError.message,
            });
        }

        // ======================================================
        // SUCCESS
        // ======================================================

        return res.status(201).json({
            status: "success",

            message:
                "Registration successful",

            user: {
                id: authData.user.id,
                email:
                    authData.user.email,
                role: profile.role,
            },

            profile,
        });

    } catch (error) {
        console.error(
            "Registration error:",
            error
        );

        return res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
};

// ============================================================
// LOGIN
// ============================================================

const login = async (req, res) => {
    try {
        let {
            userId,
            password,
        } = req.body;

        console.log(
            "\n========== LOGIN ATTEMPT =========="
        );

        console.log(
            "PMC User ID:",
            userId
        );

        console.log(
            "Password received:",
            password ? "YES" : "NO"
        );

        // ------------------------------------------------------
        // Check required fields
        // ------------------------------------------------------

        if (!userId || !password) {
            return res.status(400).json({
                status: "error",
                message:
                    "PMC User ID and password are required",
            });
        }

        userId = userId.trim();

        // ======================================================
        // STEP 1: FIND PMC PROFILE
        // ======================================================

        const {
            data: profile,
            error: profileError,
        } = await supabase
            .from("profiles")
            .select(
                "id, user_id, full_name, pmc_user_id, role"
            )
            .eq(
                "pmc_user_id",
                userId
            )
            .maybeSingle();

        console.log(
            "STEP 1 - Profile:",
            profile
        );

        console.log(
            "STEP 1 - Profile error:",
            profileError
        );

        if (profileError) {
            console.error(
                "PROFILE QUERY ERROR:",
                profileError
            );

            return res.status(500).json({
                status: "error",
                message:
                    "Unable to check PMC account",
            });
        }

        if (!profile) {
            console.log(
                "❌ NO PROFILE FOUND FOR:",
                userId
            );

            return res.status(401).json({
                status: "error",
                message:
                    "Invalid PMC User ID or password",
            });
        }

        console.log(
            "✅ PROFILE FOUND"
        );

        console.log(
            "Supabase Auth User ID:",
            profile.user_id
        );

        console.log(
            "User role:",
            profile.role
        );

        // ======================================================
        // STEP 2: FIND SUPABASE AUTH USER
        // ======================================================

        const {
            data: authUser,
            error: authError,
        } =
            await supabase.auth.admin.getUserById(
                profile.user_id
            );

        console.log(
            "STEP 2 - Auth user:",
            authUser?.user
                ? {
                      id:
                          authUser.user.id,

                      email:
                          authUser.user.email,

                      emailConfirmed:
                          authUser.user
                              .email_confirmed_at,
                  }
                : null
        );

        console.log(
            "STEP 2 - Auth error:",
            authError
        );

        if (
            authError ||
            !authUser?.user
        ) {
            console.error(
                "❌ AUTH USER NOT FOUND"
            );

            return res.status(401).json({
                status: "error",
                message:
                    "Unable to find user account",
            });
        }

        const email =
            authUser.user.email;

        console.log(
            "✅ AUTH USER FOUND"
        );

        console.log(
            "Email:",
            email
        );

        // ======================================================
        // STEP 3: SIGN IN WITH EMAIL + PASSWORD
        // ======================================================

        const {
            data,
            error,
        } =
            await supabase.auth.signInWithPassword(
                {
                    email,
                    password,
                }
            );

        console.log(
            "STEP 3 - Sign in result:",
            data?.user
                ? {
                      id:
                          data.user.id,

                      email:
                          data.user.email,
                  }
                : null
        );

        console.log(
            "STEP 3 - Sign in error:",
            error
        );

        if (error) {
            console.error(
                "❌ SUPABASE LOGIN FAILED:",
                error.message
            );

            return res.status(401).json({
                status: "error",
                message:
                    error.message,
            });
        }

        // ======================================================
        // STEP 4: SUCCESS
        // ======================================================

        console.log(
            "✅ LOGIN SUCCESSFUL"
        );

        console.log(
            "Role:",
            profile.role
        );

        console.log(
            "====================================\n"
        );

        return res.status(200).json({
            status: "success",

            message:
                "Login successful",

            user: {
                id: data.user.id,

                email:
                    data.user.email,

                fullName:
                    profile.full_name,

                pmcUserId:
                    profile.pmc_user_id,

                role:
                    profile.role,
            },

            session: data.session,
        });

    } catch (error) {
        console.error(
            "🔥 LOGIN SERVER ERROR:",
            error
        );

        return res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
};

// ============================================================
// LOGOUT
// ============================================================

const logout = async (req, res) => {
    try {
        const {
            error,
        } = await supabase.auth.signOut();

        if (error) {
            return res.status(400).json({
                status: "error",
                message:
                    error.message,
            });
        }

        return res.status(200).json({
            status: "success",
            message:
                "Logout successful",
        });

    } catch (error) {
        console.error(
            "Logout error:",
            error
        );

        return res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
};

// ============================================================
// GET CURRENT USER
// ============================================================

const getCurrentUser = async (
    req,
    res
) => {
    try {
        // ------------------------------------------------------
        // Get Authorization header
        // ------------------------------------------------------

        const authHeader =
            req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith(
                "Bearer "
            )
        ) {
            return res.status(401).json({
                status: "error",
                message:
                    "Authorization token is required",
            });
        }

        // ------------------------------------------------------
        // Extract token
        // ------------------------------------------------------

        const token =
            authHeader.split(" ")[1];

        // ------------------------------------------------------
        // Get authenticated Supabase user
        // ------------------------------------------------------

        const {
            data,
            error,
        } =
            await supabase.auth.getUser(
                token
            );

        if (
            error ||
            !data?.user
        ) {
            return res.status(401).json({
                status: "error",
                message:
                    "Invalid or expired token",
            });
        }

        // ======================================================
        // GET PROFILE
        // ======================================================

        const {
            data: profile,
            error: profileError,
        } =
            await supabase
                .from("profiles")
                .select(
                    "id, user_id, full_name, pmc_user_id, role"
                )
                .eq(
                    "user_id",
                    data.user.id
                )
                .maybeSingle();

        if (profileError) {
            console.error(
                "Get profile error:",
                profileError
            );

            return res.status(500).json({
                status: "error",
                message:
                    "Unable to load user profile",
            });
        }

        // ======================================================
        // RESPONSE
        // ======================================================

        return res.status(200).json({
            status: "success",

            user: {
                id: data.user.id,

                email:
                    data.user.email,

                fullName:
                    profile?.full_name ||
                    "",

                pmcUserId:
                    profile?.pmc_user_id ||
                    "",

                role:
                    profile?.role ||
                    "user",
            },

            profile:
                profile || null,
        });

    } catch (error) {
        console.error(
            "Get current user error:",
            error
        );

        return res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
};

// ============================================================
// FORGOT PASSWORD
// ============================================================

const forgotPassword = async (
    req,
    res
) => {
    try {
        let { email } =
            req.body;

        if (!email) {
            return res.status(400).json({
                status: "error",
                message:
                    "Email is required",
            });
        }

        email =
            email
                .trim()
                .toLowerCase();

        const {
            error,
        } =
            await supabase.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo:
                        "http://localhost:5173/reset-password",
                }
            );

        if (error) {
            return res.status(400).json({
                status: "error",
                message:
                    error.message,
            });
        }

        return res.status(200).json({
            status: "success",
            message:
                "If the email exists, a password reset link has been sent.",
        });

    } catch (error) {
        console.error(
            "Forgot password error:",
            error
        );

        return res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
};

// ============================================================
// RESET PASSWORD
// ============================================================

const resetPassword = async (
    req,
    res
) => {
    try {
        const {
            accessToken,
            newPassword,
        } = req.body;

        if (
            !accessToken ||
            !newPassword
        ) {
            return res.status(400).json({
                status: "error",
                message:
                    "Access token and new password are required",
            });
        }

        if (
            newPassword.length < 6
        ) {
            return res.status(400).json({
                status: "error",
                message:
                    "Password must be at least 6 characters",
            });
        }

        // ------------------------------------------------------
        // Verify recovery token
        // ------------------------------------------------------

        const {
            data: userData,
            error: userError,
        } =
            await supabase.auth.getUser(
                accessToken
            );

        if (
            userError ||
            !userData.user
        ) {
            console.error(
                "Token verification error:",
                userError
            );

            return res.status(401).json({
                status: "error",
                message:
                    "Invalid or expired reset link",
            });
        }

        const userId =
            userData.user.id;

        console.log(
            "Resetting password for user:",
            userId
        );

        // ------------------------------------------------------
        // Update password
        // ------------------------------------------------------

        const {
            error,
        } =
            await supabase.auth.admin.updateUserById(
                userId,
                {
                    password:
                        newPassword,
                }
            );

        if (error) {
            console.error(
                "Password update error:",
                error
            );

            return res.status(400).json({
                status: "error",
                message:
                    error.message,
            });
        }

        return res.status(200).json({
            status: "success",
            message:
                "Password updated successfully",
        });

    } catch (error) {
        console.error(
            "Reset password server error:",
            error
        );

        return res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    register,
    login,
    logout,
    getCurrentUser,
    forgotPassword,
    resetPassword,
};