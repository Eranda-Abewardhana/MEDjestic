import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// ── Doctor Dashboard Stats ────────────────────────────────────────
export const fetchDoctorStats = createAsyncThunk(
  'doctor/fetchDoctorStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/appointments/doctor/stats');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

// ── Today's Appointments (populated with patient name) ───────────
export const fetchTodayAppointments = createAsyncThunk(
  'doctor/fetchTodayAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/appointments/today');
      return res.data.data.appointments;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch today appointments');
    }
  }
);

// ── All Doctor Appointments (for Appointment List page) ───────────
export const fetchDoctorAppointments = createAsyncThunk(
  'doctor/fetchDoctorAppointments',
  async (params, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/appointments', { params });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

// ── Doctor's Patients (from appointments) ─────────────────────────
export const fetchDoctorPatients = createAsyncThunk(
  'doctor/fetchDoctorPatients',
  async (params, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/appointments/doctor/patients', { params });
      return res.data.data.patients;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch patients');
    }
  }
);

// ── Doctor's Lab Reports (from appointed patients) ────────────────
export const fetchDoctorLabReports = createAsyncThunk(
  'doctor/fetchDoctorLabReports',
  async (params, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/lab/doctor/reports', { params });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch lab reports');
    }
  }
);

// ── Start Session (update appointment status to in-consultation) ──
export const startSession = createAsyncThunk(
  'doctor/startSession',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/appointments/${appointmentId}/status`, {
        status: 'in-consultation',
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to start session');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────
const doctorSlice = createSlice({
  name: 'doctor',
  initialState: {
    stats: {
      todayAppointments: 0,
      totalPatients: 0,
      pendingReports: 0,
    },
    statsLoading: false,
    statsError: null,

    todayAppointments: [],
    todayLoading: false,
    todayError: null,

    appointments: [],
    appointmentsTotal: 0,
    appointmentsLoading: false,
    appointmentsError: null,

    patients: [],
    patientsLoading: false,
    patientsError: null,

    labReports: [],
    labReportsTotal: 0,
    labReportsLoading: false,
    labReportsError: null,

    sessionLoading: false,
    sessionError: null,
  },
  reducers: {
    clearSessionError: (state) => {
      state.sessionError = null;
    },
  },
  extraReducers: (builder) => {
    // Stats
    builder
      .addCase(fetchDoctorStats.pending, (s) => { s.statsLoading = true; s.statsError = null; })
      .addCase(fetchDoctorStats.fulfilled, (s, a) => { s.statsLoading = false; s.stats = a.payload; })
      .addCase(fetchDoctorStats.rejected, (s, a) => { s.statsLoading = false; s.statsError = a.payload; });

    // Today's appointments
    builder
      .addCase(fetchTodayAppointments.pending, (s) => { s.todayLoading = true; s.todayError = null; })
      .addCase(fetchTodayAppointments.fulfilled, (s, a) => { s.todayLoading = false; s.todayAppointments = a.payload; })
      .addCase(fetchTodayAppointments.rejected, (s, a) => { s.todayLoading = false; s.todayError = a.payload; });

    // All appointments
    builder
      .addCase(fetchDoctorAppointments.pending, (s) => { s.appointmentsLoading = true; s.appointmentsError = null; })
      .addCase(fetchDoctorAppointments.fulfilled, (s, a) => {
        s.appointmentsLoading = false;
        s.appointments = a.payload.appointments;
        s.appointmentsTotal = a.payload.total || a.payload.appointments?.length || 0;
      })
      .addCase(fetchDoctorAppointments.rejected, (s, a) => { s.appointmentsLoading = false; s.appointmentsError = a.payload; });

    // Patients
    builder
      .addCase(fetchDoctorPatients.pending, (s) => { s.patientsLoading = true; s.patientsError = null; })
      .addCase(fetchDoctorPatients.fulfilled, (s, a) => { s.patientsLoading = false; s.patients = a.payload; })
      .addCase(fetchDoctorPatients.rejected, (s, a) => { s.patientsLoading = false; s.patientsError = a.payload; });

    // Lab reports
    builder
      .addCase(fetchDoctorLabReports.pending, (s) => { s.labReportsLoading = true; s.labReportsError = null; })
      .addCase(fetchDoctorLabReports.fulfilled, (s, a) => {
        s.labReportsLoading = false;
        s.labReports = a.payload.tests;
        s.labReportsTotal = a.payload.total || 0;
      })
      .addCase(fetchDoctorLabReports.rejected, (s, a) => { s.labReportsLoading = false; s.labReportsError = a.payload; });

    // Start session
    builder
      .addCase(startSession.pending, (s) => { s.sessionLoading = true; s.sessionError = null; })
      .addCase(startSession.fulfilled, (s, a) => {
        s.sessionLoading = false;
        // Update the appointment status in todayAppointments list
        const idx = s.todayAppointments.findIndex((apt) => apt._id === a.payload._id);
        if (idx !== -1) s.todayAppointments[idx] = a.payload;
      })
      .addCase(startSession.rejected, (s, a) => { s.sessionLoading = false; s.sessionError = a.payload; });
  },
});

export const { clearSessionError } = doctorSlice.actions;
export default doctorSlice.reducer;
