ALTER TABLE perks
  ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

WITH ordered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      ORDER BY featured DESC, approved_at DESC NULLS LAST, created_at DESC
    ) - 1 AS seq
  FROM perks
)
UPDATE perks AS p
SET sort_order = ordered.seq
FROM ordered
WHERE p.id = ordered.id;

CREATE INDEX perks_status_sort_order_idx ON perks (status, sort_order);
