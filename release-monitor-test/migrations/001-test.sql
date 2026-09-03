-- Release monitor integration-test migration.
ALTER TABLE release_monitor_test ADD COLUMN enabled BOOLEAN DEFAULT FALSE;
