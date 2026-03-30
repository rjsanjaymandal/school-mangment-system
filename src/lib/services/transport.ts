import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleServiceError } from "../error-handler";

export const TransportService = {
  async getAllRoutes(filters?: { status?: string }) {
    try {
      const supabase = createClient();
      let query = supabase
        .from("bus_routes")
        .select(`
          *,
          stops:bus_stops(*)
        `)
        .order("name", { ascending: true });

      if (filters?.status) query = query.eq("status", filters.status);

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getRouteById(id: string) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("bus_routes")
        .select(`
          *,
          stops:bus_stops(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async createRoute(routeData: {
    name: string;
    route_number?: string;
    driver_name?: string;
    driver_phone?: string;
    plate_number?: string;
    capacity?: number;
    status?: string;
  }) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("bus_routes")
        .insert({
          ...routeData,
          capacity: routeData.capacity || 40,
          status: routeData.status || 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async updateRoute(id: string, routeData: Partial<{
    name: string;
    route_number: string;
    driver_name: string;
    driver_phone: string;
    plate_number: string;
    capacity: number;
    status: string;
  }>) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("bus_routes")
        .update(routeData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async deleteRoute(id: string) {
    try {
      const supabase = createAdminClient();
      const { error } = await supabase.from("bus_routes").delete().eq("id", id);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getAllStops(routeId?: string) {
    try {
      const supabase = createClient();
      let query = supabase
        .from("bus_stops")
        .select(`
          *,
          route:bus_routes(name, route_number)
        `)
        .order("stop_order", { ascending: true });

      if (routeId) query = query.eq("route_id", routeId);

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async createStop(stopData: {
    route_id: string;
    name: string;
    pickup_time?: string;
    drop_time?: string;
    stop_order?: number;
  }) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("bus_stops")
        .insert(stopData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async updateStop(id: string, stopData: Partial<{
    route_id: string;
    name: string;
    pickup_time: string;
    drop_time: string;
    stop_order: number;
  }>) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("bus_stops")
        .update(stopData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async deleteStop(id: string) {
    try {
      const supabase = createAdminClient();
      const { error } = await supabase.from("bus_stops").delete().eq("id", id);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getAllAssignments(filters?: { route_id?: string; stop_id?: string }) {
    try {
      const supabase = createClient();
      let query = supabase
        .from("student_transport")
        .select(`
          *,
          student:students(id, admission_number, profile:profiles(full_name, phone)),
          route:bus_routes(name, route_number, driver_name, driver_phone, plate_number),
          stop:bus_stops(name, pickup_time, drop_time)
        `)
        .order("created_at", { ascending: false });

      if (filters?.route_id) query = query.eq("route_id", filters.route_id);
      if (filters?.stop_id) query = query.eq("stop_id", filters.stop_id);

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async assignStudent(studentId: string, routeId: string, stopId: string) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("student_transport")
        .upsert({
          student_id: studentId,
          route_id: routeId,
          stop_id: stopId
        }, { onConflict: 'student_id' })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async removeAssignment(studentId: string) {
    try {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from("student_transport")
        .delete()
        .eq("student_id", studentId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getStudentAssignment(studentId: string) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("student_transport")
        .select(`
          *,
          route:bus_routes(name, route_number, driver_name, driver_phone, plate_number),
          stop:bus_stops(name, pickup_time, drop_time)
        `)
        .eq("student_id", studentId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getRouteStudents(routeId: string) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("student_transport")
        .select(`
          *,
          student:students(id, admission_number, profile:profiles(full_name, phone)),
          stop:bus_stops(name, pickup_time, drop_time)
        `)
        .eq("route_id", routeId);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getTransportStats() {
    try {
      const supabase = createClient();
      
      const { data: routes } = await supabase
        .from("bus_routes")
        .select("id, capacity, status");

      const { data: assignments } = await supabase
        .from("student_transport")
        .select("id");

      const activeRoutes = (routes || []).filter(r => r.status === 'active').length;
      const totalCapacity = (routes || []).reduce((sum, r) => sum + (r.capacity || 0), 0);
      const assignedStudents = (assignments || []).length;

      return {
        data: {
          total_routes: routes?.length || 0,
          active_routes: activeRoutes,
          total_capacity: totalCapacity,
          assigned_students: assignedStudents,
          available_seats: totalCapacity - assignedStudents
        },
        error: null
      };
    } catch (error) {
      return handleServiceError(error);
    }
  }
};
