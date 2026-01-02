-- 数据库迁移 SQL
-- 添加新字段到 food_cards 表

-- 添加 current_food_weight 字段（当前食物重量）
ALTER TABLE food_cards 
ADD COLUMN IF NOT EXISTS current_food_weight NUMERIC;

-- 添加 current_added_water 字段（当前额外加水量）
ALTER TABLE food_cards 
ADD COLUMN IF NOT EXISTS current_added_water NUMERIC;

-- 为现有数据初始化这些字段
UPDATE food_cards 
SET 
  current_food_weight = initial_weight,
  current_added_water = initial_water_added
WHERE current_food_weight IS NULL OR current_added_water IS NULL;

-- 完成！刷新页面即可使用新功能

