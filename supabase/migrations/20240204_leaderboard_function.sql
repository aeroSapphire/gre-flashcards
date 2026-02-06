-- Server-side leaderboard aggregation function
-- This replaces client-side aggregation for better performance

CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  tests_taken bigint,
  total_correct bigint,
  total_questions bigint,
  avg_percentage numeric,
  best_score numeric,
  avg_time numeric,
  words_learned bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as user_id,
    p.display_name,
    COALESCE(COUNT(DISTINCT uta.id), 0)::bigint as tests_taken,
    COALESCE(SUM(uta.score), 0)::bigint as total_correct,
    COALESCE(SUM(uta.total_questions), 0)::bigint as total_questions,
    CASE
      WHEN SUM(uta.total_questions) > 0
      THEN ROUND((SUM(uta.score)::numeric / SUM(uta.total_questions)::numeric) * 100, 0)
      ELSE 0
    END as avg_percentage,
    COALESCE(
      MAX(ROUND((uta.score::numeric / NULLIF(uta.total_questions, 0)::numeric) * 100, 0)),
      0
    ) as best_score,
    CASE
      WHEN COUNT(uta.id) > 0
      THEN ROUND(AVG(uta.time_taken_seconds)::numeric, 0)
      ELSE 0
    END as avg_time,
    (
      SELECT COUNT(DISTINCT uwp.flashcard_id)
      FROM user_word_progress uwp
      WHERE uwp.user_id = p.id AND uwp.status = 'learned'
    )::bigint as words_learned
  FROM profiles p
  LEFT JOIN user_test_attempts uta ON p.id = uta.user_id
  GROUP BY p.id, p.display_name
  ORDER BY
    (SELECT COUNT(DISTINCT uwp.flashcard_id) FROM user_word_progress uwp WHERE uwp.user_id = p.id AND uwp.status = 'learned') DESC,
    avg_percentage DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_leaderboard() TO authenticated;

-- Create function to get personal bests for a user
CREATE OR REPLACE FUNCTION get_personal_bests(p_user_id uuid)
RETURNS TABLE (
  test_id uuid,
  test_title text,
  test_category text,
  score integer,
  total_questions integer,
  percentage numeric,
  time_taken_seconds integer,
  completed_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (uta.test_id)
    uta.test_id,
    t.title as test_title,
    t.category as test_category,
    uta.score,
    uta.total_questions,
    ROUND((uta.score::numeric / NULLIF(uta.total_questions, 0)::numeric) * 100, 0) as percentage,
    uta.time_taken_seconds,
    uta.completed_at
  FROM user_test_attempts uta
  LEFT JOIN tests t ON uta.test_id = t.id
  WHERE uta.user_id = p_user_id
  ORDER BY uta.test_id, percentage DESC, uta.completed_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_personal_bests(uuid) TO authenticated;

-- Create function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id uuid)
RETURNS TABLE (
  total_tests_taken bigint,
  total_questions_answered bigint,
  total_correct bigint,
  average_percentage numeric,
  best_category text,
  words_learned bigint
) AS $$
DECLARE
  v_best_category text;
  v_best_pct numeric := 0;
BEGIN
  -- Calculate best category
  SELECT category INTO v_best_category
  FROM (
    SELECT
      t.category,
      ROUND((SUM(uta.score)::numeric / NULLIF(SUM(uta.total_questions), 0)::numeric) * 100, 0) as pct
    FROM user_test_attempts uta
    JOIN tests t ON uta.test_id = t.id
    WHERE uta.user_id = p_user_id
    GROUP BY t.category
    ORDER BY pct DESC
    LIMIT 1
  ) sub;

  RETURN QUERY
  SELECT
    COUNT(uta.id)::bigint as total_tests_taken,
    COALESCE(SUM(uta.total_questions), 0)::bigint as total_questions_answered,
    COALESCE(SUM(uta.score), 0)::bigint as total_correct,
    CASE
      WHEN SUM(uta.total_questions) > 0
      THEN ROUND((SUM(uta.score)::numeric / SUM(uta.total_questions)::numeric) * 100, 0)
      ELSE 0
    END as average_percentage,
    COALESCE(v_best_category, 'N/A') as best_category,
    (
      SELECT COUNT(DISTINCT uwp.flashcard_id)
      FROM user_word_progress uwp
      WHERE uwp.user_id = p_user_id AND uwp.status = 'learned'
    )::bigint as words_learned
  FROM user_test_attempts uta
  WHERE uta.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_stats(uuid) TO authenticated;
