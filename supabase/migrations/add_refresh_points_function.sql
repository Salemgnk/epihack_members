-- Migration: Add function to refresh materialized view
-- This allows the points service to refresh member_points_balance

CREATE OR REPLACE FUNCTION refresh_points_balance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY member_points_balance;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION refresh_points_balance() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_points_balance() TO anon;

COMMENT ON FUNCTION refresh_points_balance IS 'Refreshes the member_points_balance materialized view after points transactions';
