import React, {
    useEffect,
    useState
} from "react";

import {
    AlertTriangle,
    AlertOctagon,
    CheckCircle2,
    Clock,
    Search,
    RefreshCw,
    Cpu,
    ShieldAlert,
    Check,
    Building2
} from "lucide-react";


const API_URL =
    "http://localhost:5000/api/alerts";


export default function Alerts() {

    const [filterType, setFilterType] =
        useState("All Events");

    const [severityFilter, setSeverityFilter] =
        useState("All");

    const [searchQuery, setSearchQuery] =
        useState("");

    const [alerts, setAlerts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =====================================================
    // FETCH ALERTS
    // =====================================================

    const fetchAlerts = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await fetch(API_URL);

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Failed to load alerts."
                );
            }

            if (
                result.status !==
                "success"
            ) {
                throw new Error(
                    result.message ||
                    "Alert API failed."
                );
            }

            setAlerts(
                result.data || []
            );

        } catch (err) {

            console.error(
                "Fetch alerts error:",
                err
            );

            setError(
                err.message ||
                "Unable to connect to alert server."
            );

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // LOAD ALERTS
    // =====================================================

    useEffect(() => {

        fetchAlerts();

    }, []);


    // =====================================================
    // ACKNOWLEDGE
    // =====================================================

    const handleAcknowledge = async (
        incident
    ) => {

        try {

            const response =
                await fetch(
                    `${API_URL}/${incident.alertId}/acknowledge`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            acknowledgement:
                                "Acknowledged"
                        })
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Failed to acknowledge alert."
                );
            }

            setAlerts(
                (previous) =>
                    previous.map(
                        (alert) =>
                            alert.alertId ===
                            incident.alertId
                                ? {
                                      ...alert,
                                      status:
                                          "Acknowledged"
                                  }
                                : alert
                    )
            );

        } catch (err) {

            console.error(
                "Acknowledge error:",
                err
            );

            setError(
                err.message ||
                "Failed to acknowledge alert."
            );
        }
    };


    // =====================================================
    // RESOLVE
    // =====================================================

    const handleResolve = async (
        incident
    ) => {

        try {

            const response =
                await fetch(
                    `${API_URL}/${incident.alertId}/resolve`,
                    {
                        method: "PATCH"
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Failed to resolve alert."
                );
            }

            setAlerts(
                (previous) =>
                    previous.map(
                        (alert) =>
                            alert.alertId ===
                            incident.alertId
                                ? {
                                      ...alert,
                                      status:
                                          "Resolved"
                                  }
                                : alert
                    )
            );

        } catch (err) {

            console.error(
                "Resolve error:",
                err
            );

            setError(
                err.message ||
                "Failed to resolve alert."
            );
        }
    };


    // =====================================================
    // FILTER
    // =====================================================

    const filteredAlerts =
        alerts.filter((item) => {

            const matchesCategory =
                filterType ===
                    "All Events" ||
                item.category ===
                    filterType;

            const matchesSeverity =
                severityFilter ===
                    "All" ||
                item.severity ===
                    severityFilter;

            const query =
                searchQuery
                    .toLowerCase()
                    .trim();

            const matchesSearch =
                !query ||
                item.station
                    ?.toLowerCase()
                    .includes(query) ||
                item.parameter
                    ?.toLowerCase()
                    .includes(query) ||
                item.id
                    ?.toLowerCase()
                    .includes(query) ||
                item.project
                    ?.toLowerCase()
                    .includes(query);

            return (
                matchesCategory &&
                matchesSeverity &&
                matchesSearch
            );
        });


    // =====================================================
    // COUNTERS
    // =====================================================

    const unresolvedCount =
        alerts.filter(
            (a) =>
                a.status ===
                "Unresolved"
        ).length;


    const criticalCount =
        alerts.filter(
            (a) =>
                a.severity ===
                    "Critical" &&
                a.status !==
                    "Resolved"
        ).length;


    const warningCount =
        alerts.filter(
            (a) =>
                (
                    a.severity ===
                        "Warning" ||
                    a.category ===
                        "Device & Battery"
                ) &&
                a.status !==
                    "Resolved"
        ).length;


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="min-h-screen bg-[#edf2f7] flex items-center justify-center">

                <div className="text-center">

                    <RefreshCw
                        size={34}
                        className="mx-auto text-blue-600 animate-spin"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading alert data...
                    </p>

                </div>

            </div>
        );
    }


    return (

        <div className="min-h-screen bg-[#edf2f7] text-slate-800 p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-600 selection:text-white">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

                <div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">

                        <span>
                            Operational Surveillance
                        </span>

                        <span>/</span>

                        <span className="text-blue-600 font-bold">
                            CPCB Section 10 Protocol
                        </span>

                    </div>


                    <div className="flex items-center gap-3">

                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            Alerts & Incident Management
                        </h1>


                        <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-3 py-1 rounded-full">

                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />

                            {unresolvedCount}
                            {" "}
                            Actions Pending

                        </span>

                    </div>


                    <p className="text-xs text-slate-500 mt-0.5">
                        Real-time CPCB threshold breaches, device telemetry timeouts, and ward field escalations.
                    </p>

                </div>


                <button
                    onClick={fetchAlerts}
                    className="self-start sm:self-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/25 transition"
                >

                    <RefreshCw size={13} />

                    <span>
                        Refresh Incident Stream
                    </span>

                </button>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-xs font-medium">

                    {error}

                </div>

            )}


            {/* =================================================
                KPI CARDS
            ================================================= */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7">


                {/* PENDING */}

                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex items-center justify-between">

                    <div>

                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                            Pending Officer Actions
                        </span>

                        <div className="text-4xl font-black text-slate-900 mt-1">
                            {unresolvedCount}
                        </div>

                        <span className="text-[11px] text-blue-600 font-semibold mt-1 inline-block">
                            Requires supervisor sign-off
                        </span>

                    </div>


                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shadow-inner">

                        <ShieldAlert size={24} />

                    </div>

                </div>


                {/* CRITICAL */}

                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex items-center justify-between">

                    <div>

                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                            Critical NAAQS Breaches
                        </span>

                        <div className="text-4xl font-black text-rose-600 mt-1">
                            {criticalCount}
                        </div>

                        <span className="text-[11px] text-rose-600 font-semibold mt-1 inline-block">
                            Active critical alerts
                        </span>

                    </div>


                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black shadow-inner">

                        <AlertOctagon size={24} />

                    </div>

                </div>


                {/* WARNING */}

                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)] flex items-center justify-between">

                    <div>

                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                            Warning & Hardware Health
                        </span>

                        <div className="text-4xl font-black text-amber-600 mt-1">
                            {warningCount}
                        </div>

                        <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">
                            Active warnings
                        </span>

                    </div>


                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black shadow-inner">

                        <AlertTriangle size={24} />

                    </div>

                </div>

            </div>


            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">


                <div className="flex flex-wrap items-center gap-2">

                    {[
                        "All Events",
                        "Air Quality / AQI",
                        "Device & Battery",
                        "Maintenance"
                    ].map(
                        (cat) => (

                            <button
                                key={cat}
                                onClick={() =>
                                    setFilterType(cat)
                                }
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                                    filterType ===
                                    cat
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                                        : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                                }`}
                            >
                                {cat}
                            </button>

                        )
                    )}

                </div>


                <div className="flex items-center gap-3">

                    <div className="relative">

                        <input
                            type="text"
                            value={
                                searchQuery
                            }
                            onChange={(e) =>
                                setSearchQuery(
                                    e.target.value
                                )
                            }
                            placeholder="Search station, project, ID..."
                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 w-52 sm:w-64 transition"
                        />

                        <Search
                            size={14}
                            className="absolute left-3 top-2.5 text-slate-400"
                        />

                    </div>


                    <select
                        value={
                            severityFilter
                        }
                        onChange={(e) =>
                            setSeverityFilter(
                                e.target.value
                            )
                        }
                        className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
                    >

                        <option value="All">
                            All Severities
                        </option>

                        <option value="Critical">
                            Critical Only
                        </option>

                        <option value="Warning">
                            Warning Only
                        </option>

                        <option value="Info">
                            Info Only
                        </option>

                    </select>

                </div>

            </div>


            {/* =================================================
                INCIDENTS
            ================================================= */}

            <div className="space-y-4 mb-7">

                <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500">

                    <span>
                        SHOWING{" "}
                        {filteredAlerts.length}
                        {" "}ESCALATIONS
                    </span>

                    <span className="text-emerald-700">
                        CPCB Automated Surveillance Engine Active
                    </span>

                </div>


                {filteredAlerts.length === 0 ? (

                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">

                        <CheckCircle2
                            size={42}
                            className="mx-auto text-emerald-500 mb-2"
                        />

                        <h3 className="text-base font-black text-slate-900">
                            No Alerts Found
                        </h3>

                        <p className="text-xs text-slate-400 mt-1">
                            No alerts match the current filters.
                        </p>

                    </div>

                ) : (

                    filteredAlerts.map(
                        (incident) => {

                            const isCritical =
                                incident.severity ===
                                "Critical";

                            const isWarning =
                                incident.severity ===
                                "Warning";


                            return (

                                <div
                                    key={
                                        incident.alertId
                                    }
                                    className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] ${
                                        isCritical
                                            ? "border-rose-300 ring-1 ring-rose-500/20"
                                            : isWarning
                                            ? "border-amber-300"
                                            : "border-slate-200"
                                    }`}
                                >


                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">


                                        {/* LEFT */}

                                        <div className="flex items-start gap-4">

                                            <div
                                                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black shrink-0 ${
                                                    isCritical
                                                        ? "bg-rose-100 text-rose-700"
                                                        : isWarning
                                                        ? "bg-amber-100 text-amber-700"
                                                        : "bg-blue-100 text-blue-700"
                                                }`}
                                            >

                                                {isCritical ? (
                                                    <AlertOctagon
                                                        size={22}
                                                    />
                                                ) : isWarning ? (
                                                    <AlertTriangle
                                                        size={22}
                                                    />
                                                ) : (
                                                    <Cpu
                                                        size={22}
                                                    />
                                                )}

                                            </div>


                                            <div>

                                                <div className="flex flex-wrap items-center gap-2 mb-1">

                                                    <span
                                                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                                            isCritical
                                                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                                                : isWarning
                                                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                                                : "bg-blue-50 text-blue-700 border-blue-200"
                                                        }`}
                                                    >
                                                        {incident.severity}
                                                    </span>


                                                    <span className="text-[11px] font-mono font-bold text-slate-400">
                                                        {incident.id}
                                                    </span>


                                                    <span className="text-slate-300">
                                                        •
                                                    </span>


                                                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">

                                                        <Building2
                                                            size={13}
                                                            className="text-slate-400"
                                                        />

                                                        {incident.project}

                                                    </span>

                                                </div>


                                                <h3 className="text-base font-black text-slate-900">
                                                    {incident.parameter}
                                                </h3>


                                                <p className="text-xs text-slate-500 mt-0.5">

                                                    {incident.station}

                                                    {" • "}

                                                    <span>
                                                        Ward:{" "}
                                                        {incident.ward}
                                                    </span>

                                                    {" • Sensor: "}

                                                    <span className="font-mono">
                                                        {incident.source}
                                                    </span>

                                                </p>


                                                <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">

                                                    <strong className="text-slate-900 font-bold">
                                                        Standard Action:
                                                    </strong>

                                                    {" "}

                                                    {incident.suggestedAction}

                                                </div>

                                            </div>

                                        </div>


                                        {/* RIGHT */}

                                        <div className="flex flex-row lg:flex-col items-end justify-between lg:justify-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">


                                            <div className="text-left lg:text-right">

                                                <div className="text-xl font-black text-slate-900">

                                                    {incident.actualValue}

                                                </div>


                                                <div className="text-[10px] text-slate-400 font-medium">

                                                    Threshold:

                                                    {" "}

                                                    {incident.threshold}

                                                </div>


                                                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 mt-1 lg:justify-end">

                                                    <Clock size={12} />

                                                    <span>
                                                        {incident.timestamp}
                                                    </span>

                                                </div>

                                            </div>


                                            {/* ACTION BUTTON */}

                                            {incident.status ===
                                            "Unresolved" ? (

                                                <button
                                                    onClick={() =>
                                                        handleAcknowledge(
                                                            incident
                                                        )
                                                    }
                                                    className="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shadow-sm bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                                                >

                                                    <Check
                                                        size={14}
                                                    />

                                                    Acknowledge Incident

                                                </button>

                                            ) : incident.status ===
                                              "Acknowledged" ? (

                                                <button
                                                    onClick={() =>
                                                        handleResolve(
                                                            incident
                                                        )
                                                    }
                                                    className="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shadow-sm bg-emerald-100 text-emerald-800 border border-emerald-300"
                                                >

                                                    <Check
                                                        size={14}
                                                    />

                                                    Mark Resolved

                                                </button>

                                            ) : (

                                                <span className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200">

                                                    Resolved

                                                </span>

                                            )}

                                        </div>

                                    </div>

                                </div>

                            );
                        }
                    )

                )}

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-start gap-3">

                <CheckCircle2
                    size={18}
                    className="text-blue-600 shrink-0 mt-0.5"
                />

                <p className="text-xs text-slate-600 leading-relaxed">

                    <strong className="text-slate-900">
                        CPCB Protocol Alert Escalation:
                    </strong>

                    {" "}
                    Alerts are generated when monitored parameters exceed configured thresholds or when monitoring equipment requires attention.

                </p>

            </div>

        </div>
    );
}