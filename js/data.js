/* =========================================================
   data.js — food list, meal ideas and exercises.
   All calories are ESTIMATES. Homemade dishes vary a lot
   depending on oil, portion size and recipe.
   ========================================================= */
const DATA = {};

/* ---------- Foods for the food log (per serving) ---------- */
DATA.FOODS = [
  // Rice, bread & staples
  { id: 'f_rice1', name: 'White rice, cooked', serving: '1 cup (≈160 g)', kcal: 205, p: 4, c: 45, f: 0 },
  { id: 'f_rice_half', name: 'White rice, cooked', serving: '½ cup (≈80 g)', kcal: 103, p: 2, c: 22, f: 0 },
  { id: 'f_brownrice', name: 'Brown rice, cooked', serving: '1 cup', kcal: 215, p: 5, c: 45, f: 2 },
  { id: 'f_sinangag', name: 'Sinangag (garlic fried rice)', serving: '1 cup', kcal: 260, p: 5, c: 46, f: 6 },
  { id: 'f_pandesal', name: 'Pandesal', serving: '1 piece', kcal: 90, p: 3, c: 16, f: 1.5 },
  { id: 'f_bread', name: 'Wheat bread', serving: '1 slice', kcal: 70, p: 3, c: 12, f: 1 },
  { id: 'f_oats', name: 'Rolled oats, cooked with water', serving: '½ cup dry', kcal: 150, p: 5, c: 27, f: 3 },
  { id: 'f_kamote', name: 'Kamote (sweet potato), boiled', serving: '1 medium', kcal: 115, p: 2, c: 27, f: 0 },
  { id: 'f_corn', name: 'Corn on the cob, boiled', serving: '1 ear', kcal: 90, p: 3, c: 19, f: 1 },
  { id: 'f_champorado', name: 'Champorado', serving: '1 cup', kcal: 280, p: 6, c: 55, f: 4 },
  { id: 'f_arrozcaldo', name: 'Arroz caldo', serving: '1 bowl', kcal: 250, p: 12, c: 38, f: 6 },
  { id: 'f_spag', name: 'Filipino-style spaghetti', serving: '1 cup', kcal: 340, p: 13, c: 48, f: 10 },
  { id: 'f_pancit', name: 'Pancit bihon / canton (homemade)', serving: '1 cup', kcal: 280, p: 12, c: 40, f: 8 },
  { id: 'f_instantnoodles', name: 'Instant noodles (pancit canton type)', serving: '1 pack', kcal: 300, p: 6, c: 40, f: 13 },
  // Eggs, chicken, fish, meat
  { id: 'f_egg_boiled', name: 'Egg, boiled', serving: '1 large', kcal: 75, p: 6, c: 1, f: 5 },
  { id: 'f_egg_fried', name: 'Egg, fried', serving: '1 large', kcal: 90, p: 6, c: 1, f: 7 },
  { id: 'f_egg_scrambled', name: 'Scrambled egg', serving: '1 egg', kcal: 95, p: 6, c: 1, f: 7 },
  { id: 'f_tortang_talong', name: 'Tortang talong', serving: '1 piece', kcal: 180, p: 8, c: 8, f: 13 },
  { id: 'f_chicken_breast', name: 'Chicken breast, grilled/boiled', serving: '100 g', kcal: 165, p: 31, c: 0, f: 4 },
  { id: 'f_chicken_adobo', name: 'Chicken adobo', serving: '1 thigh piece with sauce', kcal: 230, p: 22, c: 3, f: 14 },
  { id: 'f_tinola', name: 'Chicken tinola (no rice)', serving: '1 bowl', kcal: 220, p: 22, c: 6, f: 11 },
  { id: 'f_fried_chicken', name: 'Fried chicken', serving: '1 piece (thigh)', kcal: 280, p: 20, c: 8, f: 18 },
  { id: 'f_nilaga', name: 'Nilagang manok/baka (no rice)', serving: '1 bowl', kcal: 250, p: 22, c: 15, f: 11 },
  { id: 'f_tuna_water', name: 'Tuna in water, drained', serving: '1 small can (≈100 g)', kcal: 110, p: 25, c: 0, f: 1 },
  { id: 'f_tuna_oil', name: 'Tuna flakes in oil / caldereta style', serving: '1 small can', kcal: 230, p: 18, c: 5, f: 15 },
  { id: 'f_bangus', name: 'Bangus, fried', serving: '1 slice (≈100 g)', kcal: 200, p: 20, c: 0, f: 13 },
  { id: 'f_galunggong', name: 'Galunggong, fried', serving: '1 piece', kcal: 130, p: 14, c: 0, f: 8 },
  { id: 'f_tilapia', name: 'Tilapia, grilled', serving: '1 medium', kcal: 190, p: 34, c: 0, f: 5 },
  { id: 'f_sinigang_pork', name: 'Sinigang na baboy (no rice)', serving: '1 bowl', kcal: 300, p: 20, c: 8, f: 21 },
  { id: 'f_sinigang_fish', name: 'Sinigang na isda/hipon (no rice)', serving: '1 bowl', kcal: 170, p: 22, c: 8, f: 5 },
  { id: 'f_pork_adobo', name: 'Pork adobo', serving: '1 cup', kcal: 450, p: 28, c: 4, f: 36 },
  { id: 'f_menudo', name: 'Pork menudo', serving: '¾ cup', kcal: 300, p: 18, c: 12, f: 20 },
  { id: 'f_lechon_kawali', name: 'Lechon kawali', serving: '100 g', kcal: 450, p: 18, c: 0, f: 42 },
  { id: 'f_longganisa', name: 'Longganisa', serving: '2 pieces', kcal: 260, p: 12, c: 8, f: 20 },
  { id: 'f_hotdog', name: 'Hotdog', serving: '1 piece', kcal: 150, p: 5, c: 3, f: 13 },
  { id: 'f_tapa', name: 'Beef tapa', serving: '60 g', kcal: 180, p: 16, c: 6, f: 10 },
  { id: 'f_lumpia', name: 'Lumpiang shanghai', serving: '1 piece', kcal: 60, p: 3, c: 4, f: 4 },
  // Beans, tofu & vegetables
  { id: 'f_monggo', name: 'Ginisang monggo', serving: '1 cup', kcal: 200, p: 13, c: 25, f: 5 },
  { id: 'f_tofu_fried', name: 'Tokwa (tofu), fried', serving: '100 g', kcal: 200, p: 14, c: 5, f: 14 },
  { id: 'f_tofu', name: 'Tofu, plain', serving: '100 g', kcal: 76, p: 8, c: 2, f: 5 },
  { id: 'f_pinakbet', name: 'Pinakbet', serving: '1 cup', kcal: 150, p: 5, c: 15, f: 8 },
  { id: 'f_chopsuey', name: 'Chop suey', serving: '1 cup', kcal: 140, p: 8, c: 12, f: 7 },
  { id: 'f_sayote', name: 'Ginisang sayote', serving: '1 cup', kcal: 110, p: 5, c: 10, f: 6 },
  { id: 'f_kangkong', name: 'Adobong kangkong', serving: '1 cup', kcal: 100, p: 3, c: 8, f: 6 },
  { id: 'f_ginataang', name: 'Ginataang kalabasa at sitaw', serving: '1 cup', kcal: 230, p: 5, c: 18, f: 16 },
  { id: 'f_veg_steamed', name: 'Steamed vegetables', serving: '1 cup', kcal: 50, p: 3, c: 9, f: 0 },
  { id: 'f_ensalada', name: 'Tomato & cucumber salad', serving: '1 cup', kcal: 30, p: 1, c: 6, f: 0 },
  // Fruit
  { id: 'f_banana_lakatan', name: 'Banana (lakatan)', serving: '1 medium', kcal: 100, p: 1, c: 26, f: 0 },
  { id: 'f_saba', name: 'Saba banana, boiled', serving: '1 piece', kcal: 110, p: 1, c: 29, f: 0 },
  { id: 'f_mango', name: 'Ripe mango', serving: '½ medium', kcal: 100, p: 1, c: 25, f: 0 },
  { id: 'f_apple', name: 'Apple', serving: '1 medium', kcal: 95, p: 0, c: 25, f: 0 },
  { id: 'f_papaya', name: 'Papaya', serving: '1 cup', kcal: 60, p: 1, c: 15, f: 0 },
  { id: 'f_watermelon', name: 'Watermelon', serving: '1 cup', kcal: 45, p: 1, c: 11, f: 0 },
  // Snacks & sweets
  { id: 'f_crackers', name: 'Plain crackers', serving: '1 pack (≈25 g)', kcal: 120, p: 2, c: 17, f: 5 },
  { id: 'f_peanuts', name: 'Roasted peanuts', serving: '2 tbsp (≈18 g)', kcal: 105, p: 5, c: 3, f: 9 },
  { id: 'f_peanutbutter', name: 'Peanut butter', serving: '1 tbsp', kcal: 95, p: 4, c: 3, f: 8 },
  { id: 'f_turon', name: 'Turon', serving: '1 piece', kcal: 180, p: 1, c: 30, f: 6 },
  { id: 'f_bananacue', name: 'Banana cue', serving: '1 stick (2 pcs)', kcal: 250, p: 1, c: 50, f: 6 },
  { id: 'f_taho', name: 'Taho', serving: '1 small cup', kcal: 150, p: 8, c: 25, f: 3 },
  { id: 'f_fishball', name: 'Fishballs with sauce', serving: '10 pieces', kcal: 180, p: 6, c: 24, f: 6 },
  { id: 'f_kwekkwek', name: 'Kwek-kwek', serving: '3 pieces', kcal: 210, p: 9, c: 15, f: 13 },
  { id: 'f_siopao', name: 'Siopao (asado)', serving: '1 piece', kcal: 300, p: 11, c: 45, f: 8 },
  { id: 'f_ensaymada', name: 'Ensaymada', serving: '1 piece', kcal: 300, p: 6, c: 38, f: 14 },
  { id: 'f_halohalo', name: 'Halo-halo', serving: '1 glass', kcal: 350, p: 6, c: 70, f: 6 },
  { id: 'f_chips', name: 'Potato chips', serving: '1 small pack (≈30 g)', kcal: 160, p: 2, c: 15, f: 10 },
  { id: 'f_chocolate', name: 'Milk chocolate', serving: '1 small bar (≈25 g)', kcal: 135, p: 2, c: 15, f: 8 },
  // Drinks
  { id: 'f_milk', name: 'Milk, low-fat', serving: '1 cup (240 mL)', kcal: 105, p: 8, c: 12, f: 2.5 },
  { id: 'f_milk_full', name: 'Milk, full cream', serving: '1 cup (240 mL)', kcal: 150, p: 8, c: 12, f: 8 },
  { id: 'f_coffee_black', name: 'Black coffee', serving: '1 cup', kcal: 5, p: 0, c: 1, f: 0 },
  { id: 'f_coffee_3in1', name: '3-in-1 coffee', serving: '1 sachet', kcal: 110, p: 1, c: 18, f: 4 },
  { id: 'f_milktea', name: 'Milk tea with pearls', serving: '1 medium (≈500 mL)', kcal: 350, p: 3, c: 60, f: 10 },
  { id: 'f_softdrink', name: 'Soft drink', serving: '1 can (330 mL)', kcal: 140, p: 0, c: 37, f: 0 },
  { id: 'f_juice', name: 'Powdered juice drink', serving: '1 glass', kcal: 90, p: 0, c: 23, f: 0 },
  { id: 'f_buko', name: 'Buko juice (fresh)', serving: '1 glass', kcal: 45, p: 0, c: 11, f: 0 }
];

/* ---------- Meal ideas for the planner ----------
   main: main protein (used to avoid repeats)
   budget: 'low' = very budget-friendly, 'mid' = a bit pricier
   tags: ingredients (used for likes, dislikes and allergies) */
DATA.MEALS = [
  // Breakfast
  { id: 'b1', slot: 'breakfast', name: 'Sinangag, fried egg & tomato', desc: '¾ cup garlic rice, 1 egg fried in a little oil, sliced tomato.', kcal: 300, p: 10, c: 38, f: 12, main: 'egg', budget: 'low', tags: ['rice', 'garlic', 'egg', 'tomato'] },
  { id: 'b2', slot: 'breakfast', name: 'Oatmeal with banana', desc: '½ cup oats cooked in water, 1 sliced lakatan banana, a pinch of cinnamon.', kcal: 265, p: 6, c: 52, f: 3, main: 'oats', budget: 'low', tags: ['oats', 'banana'] },
  { id: 'b3', slot: 'breakfast', name: 'Pandesal with scrambled egg', desc: '2 pandesal with 1 scrambled egg and black coffee or tea.', kcal: 300, p: 12, c: 36, f: 11, main: 'egg', budget: 'low', tags: ['bread', 'pandesal', 'wheat', 'gluten', 'egg'] },
  { id: 'b4', slot: 'breakfast', name: 'Arroz caldo with egg', desc: '1½ cups chicken arroz caldo with ginger and ½ boiled egg.', kcal: 320, p: 18, c: 42, f: 8, main: 'chicken', budget: 'low', tags: ['rice', 'chicken', 'egg', 'ginger'] },
  { id: 'b5', slot: 'breakfast', name: 'Boiled eggs & saba', desc: '2 boiled eggs, 1 boiled saba banana, black coffee or tea.', kcal: 260, p: 13, c: 29, f: 10, main: 'egg', budget: 'low', tags: ['egg', 'banana', 'saba'] },
  { id: 'b6', slot: 'breakfast', name: 'Tuna sandwich', desc: '2 slices wheat bread, tuna in water, 1 tsp light mayo, cucumber.', kcal: 300, p: 22, c: 30, f: 9, main: 'tuna', budget: 'low', tags: ['bread', 'wheat', 'gluten', 'tuna', 'fish', 'seafood', 'mayonnaise', 'egg', 'cucumber'] },
  { id: 'b7', slot: 'breakfast', name: 'Tortang talong & rice', desc: '1 eggplant omelette with ½ cup rice.', kcal: 290, p: 10, c: 30, f: 14, main: 'egg', budget: 'low', tags: ['eggplant', 'talong', 'egg', 'rice'] },
  { id: 'b8', slot: 'breakfast', name: 'Kamote, egg & milk', desc: '1 boiled sweet potato, 1 boiled egg, 1 cup low-fat milk.', kcal: 295, p: 15, c: 40, f: 8, main: 'egg', budget: 'low', tags: ['kamote', 'sweet potato', 'egg', 'milk', 'dairy'] },
  { id: 'b9', slot: 'breakfast', name: 'Champorado (less sugar)', desc: '1 cup chocolate rice porridge with a splash of milk.', kcal: 300, p: 6, c: 58, f: 4, main: 'rice', budget: 'low', tags: ['rice', 'cocoa', 'chocolate', 'milk', 'dairy'] },
  { id: 'b10', slot: 'breakfast', name: 'Tapsilog (lighter)', desc: '60 g beef tapa, ¾ cup garlic rice, 1 egg.', kcal: 450, p: 28, c: 42, f: 18, main: 'beef', budget: 'mid', tags: ['beef', 'rice', 'garlic', 'egg'] },

  // Lunch (1 cup rice)
  { id: 'l1', slot: 'lunch', name: 'Ginisang monggo with malunggay', desc: '1 cup monggo stew with malunggay leaves and 1 cup rice.', kcal: 410, p: 17, c: 70, f: 6, main: 'monggo', budget: 'low', tags: ['monggo', 'mung bean', 'malunggay', 'rice', 'garlic'] },
  { id: 'l2', slot: 'lunch', name: 'Chicken tinola', desc: '1 bowl tinola (1 chicken piece, green papaya, ginger) with 1 cup rice.', kcal: 425, p: 26, c: 50, f: 11, main: 'chicken', budget: 'low', tags: ['chicken', 'papaya', 'sayote', 'ginger', 'rice'] },
  { id: 'l3', slot: 'lunch', name: 'Tuna omelette', desc: '1 egg + ½ can tuna omelette, 1 cup rice, sliced tomato.', kcal: 400, p: 24, c: 47, f: 11, main: 'tuna', budget: 'low', tags: ['tuna', 'fish', 'seafood', 'egg', 'rice', 'tomato'] },
  { id: 'l4', slot: 'lunch', name: 'Chicken adobo & veggies', desc: '1 skinless chicken thigh adobo, 1 cup rice, steamed vegetables.', kcal: 465, p: 28, c: 50, f: 15, main: 'chicken', budget: 'low', tags: ['chicken', 'soy sauce', 'soy', 'vinegar', 'garlic', 'rice'] },
  { id: 'l5', slot: 'lunch', name: 'Pinakbet with egg', desc: '1 cup pinakbet (squash, eggplant, okra, sitaw), 1 cup rice, 1 boiled egg.', kcal: 430, p: 13, c: 58, f: 15, main: 'veg', budget: 'low', tags: ['squash', 'kalabasa', 'eggplant', 'okra', 'ampalaya', 'bagoong', 'shrimp', 'shellfish', 'rice', 'egg'] },
  { id: 'l6', slot: 'lunch', name: 'Sinigang na bangus', desc: '1 bowl milkfish sinigang with kangkong and radish, 1 cup rice.', kcal: 435, p: 25, c: 52, f: 12, main: 'fish', budget: 'mid', tags: ['bangus', 'milkfish', 'fish', 'seafood', 'kangkong', 'radish', 'tomato', 'rice'] },
  { id: 'l7', slot: 'lunch', name: 'Ginisang sayote with chicken', desc: 'Sautéed chayote with chicken strips, 1 cup rice.', kcal: 370, p: 18, c: 52, f: 9, main: 'chicken', budget: 'low', tags: ['sayote', 'chayote', 'chicken', 'rice'] },
  { id: 'l8', slot: 'lunch', name: 'Pancit bihon with chicken', desc: '1½ cups rice noodles with chicken, cabbage and carrots.', kcal: 420, p: 20, c: 60, f: 11, main: 'chicken', budget: 'low', tags: ['bihon', 'noodles', 'chicken', 'cabbage', 'carrot', 'soy sauce', 'soy'] },
  { id: 'l9', slot: 'lunch', name: 'Adobong kangkong & tokwa', desc: '1 cup kangkong adobo, 75 g fried tofu, 1 cup rice.', kcal: 455, p: 18, c: 54, f: 17, main: 'tofu', budget: 'low', tags: ['kangkong', 'tofu', 'tokwa', 'soy', 'soy sauce', 'rice'] },
  { id: 'l10', slot: 'lunch', name: 'Chicken sotanghon soup', desc: '1 big bowl sotanghon soup with chicken and vegetables, 1 pandesal.', kcal: 390, p: 20, c: 52, f: 9, main: 'chicken', budget: 'low', tags: ['chicken', 'sotanghon', 'noodles', 'bread', 'wheat', 'gluten'] },
  { id: 'l11', slot: 'lunch', name: 'Paksiw na galunggong', desc: '2 galunggong in vinegar stew, 1 cup rice, ginisang pechay.', kcal: 465, p: 30, c: 50, f: 14, main: 'fish', budget: 'low', tags: ['galunggong', 'fish', 'seafood', 'vinegar', 'pechay', 'rice'] },
  { id: 'l12', slot: 'lunch', name: 'Pork menudo', desc: '¾ cup menudo with potato and carrots, 1 cup rice.', kcal: 505, p: 22, c: 57, f: 20, main: 'pork', budget: 'mid', tags: ['pork', 'potato', 'carrot', 'tomato', 'rice'] },

  // Dinner (¾ cup rice — a little lighter)
  { id: 'd1', slot: 'dinner', name: 'Chicken tinola (light)', desc: '1 bowl tinola with ¾ cup rice.', kcal: 375, p: 25, c: 38, f: 11, main: 'chicken', budget: 'low', tags: ['chicken', 'papaya', 'sayote', 'ginger', 'rice'] },
  { id: 'd2', slot: 'dinner', name: 'Ginisang monggo (light)', desc: '1 cup monggo with malunggay and ¾ cup rice.', kcal: 355, p: 16, c: 58, f: 6, main: 'monggo', budget: 'low', tags: ['monggo', 'mung bean', 'malunggay', 'rice'] },
  { id: 'd3', slot: 'dinner', name: 'Sinigang na hipon', desc: '1 bowl shrimp sinigang with vegetables, ¾ cup rice.', kcal: 310, p: 22, c: 42, f: 3, main: 'shrimp', budget: 'mid', tags: ['shrimp', 'hipon', 'shellfish', 'seafood', 'kangkong', 'radish', 'rice'] },
  { id: 'd4', slot: 'dinner', name: 'Chicken adobo (light)', desc: '1 skinless thigh adobo, ¾ cup rice, steamed vegetables.', kcal: 415, p: 27, c: 40, f: 15, main: 'chicken', budget: 'low', tags: ['chicken', 'soy sauce', 'soy', 'vinegar', 'garlic', 'rice'] },
  { id: 'd5', slot: 'dinner', name: 'Tofu chop suey', desc: '1½ cups vegetable chop suey with tofu, ¾ cup rice.', kcal: 355, p: 15, c: 45, f: 12, main: 'tofu', budget: 'low', tags: ['tofu', 'soy', 'cabbage', 'carrot', 'sayote', 'rice'] },
  { id: 'd6', slot: 'dinner', name: 'Tortang talong & salad', desc: '1 tortang talong, ¾ cup rice, tomato-onion salad.', kcal: 355, p: 10, c: 40, f: 15, main: 'egg', budget: 'low', tags: ['eggplant', 'talong', 'egg', 'tomato', 'onion', 'rice'] },
  { id: 'd7', slot: 'dinner', name: 'Ginisang pechay with tuna', desc: 'Sautéed pechay with ½ can tuna, ¾ cup rice.', kcal: 325, p: 20, c: 37, f: 9, main: 'tuna', budget: 'low', tags: ['tuna', 'fish', 'seafood', 'pechay', 'rice'] },
  { id: 'd8', slot: 'dinner', name: 'Nilagang manok', desc: 'Chicken soup with potato, cabbage and pechay, ¾ cup rice.', kcal: 405, p: 26, c: 45, f: 11, main: 'chicken', budget: 'low', tags: ['chicken', 'potato', 'cabbage', 'pechay', 'rice'] },
  { id: 'd9', slot: 'dinner', name: 'Ginataang kalabasa at sitaw', desc: '1 cup squash & string beans in coconut milk (no shrimp), ¾ cup rice.', kcal: 385, p: 7, c: 50, f: 17, main: 'veg', budget: 'low', tags: ['kalabasa', 'squash', 'sitaw', 'string beans', 'coconut', 'coconut milk', 'gata', 'rice'] },
  { id: 'd10', slot: 'dinner', name: 'Inihaw na tilapia', desc: '1 grilled tilapia, ¾ cup rice, ensaladang talong.', kcal: 395, p: 34, c: 42, f: 8, main: 'fish', budget: 'low', tags: ['tilapia', 'fish', 'seafood', 'eggplant', 'tomato', 'rice'] },
  { id: 'd11', slot: 'dinner', name: 'Beef nilaga', desc: 'Beef soup with potato, corn and cabbage, ¾ cup rice.', kcal: 450, p: 28, c: 45, f: 17, main: 'beef', budget: 'mid', tags: ['beef', 'potato', 'corn', 'cabbage', 'rice'] },

  // Snacks
  { id: 's1', slot: 'snack', name: 'Boiled saba banana', desc: '1 piece.', kcal: 110, p: 1, c: 29, f: 0, main: 'fruit', budget: 'low', tags: ['banana', 'saba'] },
  { id: 's2', slot: 'snack', name: 'Lakatan banana', desc: '1 medium banana.', kcal: 100, p: 1, c: 26, f: 0, main: 'fruit', budget: 'low', tags: ['banana'] },
  { id: 's3', slot: 'snack', name: 'Boiled egg', desc: '1 large egg.', kcal: 75, p: 6, c: 1, f: 5, main: 'egg', budget: 'low', tags: ['egg'] },
  { id: 's4', slot: 'snack', name: 'Boiled kamote', desc: '1 small sweet potato.', kcal: 90, p: 2, c: 21, f: 0, main: 'root', budget: 'low', tags: ['kamote', 'sweet potato'] },
  { id: 's5', slot: 'snack', name: 'Plain crackers', desc: '1 pack (≈25 g).', kcal: 120, p: 2, c: 17, f: 5, main: 'crackers', budget: 'low', tags: ['crackers', 'wheat', 'gluten'] },
  { id: 's6', slot: 'snack', name: 'Ripe mango', desc: '½ medium mango.', kcal: 100, p: 1, c: 25, f: 0, main: 'fruit', budget: 'low', tags: ['mango'] },
  { id: 's7', slot: 'snack', name: 'Roasted peanuts', desc: '2 tablespoons.', kcal: 105, p: 5, c: 3, f: 9, main: 'nuts', budget: 'low', tags: ['peanut', 'nuts'] },
  { id: 's8', slot: 'snack', name: 'Glass of low-fat milk', desc: '1 cup (240 mL).', kcal: 105, p: 8, c: 12, f: 3, main: 'dairy', budget: 'low', tags: ['milk', 'dairy'] },
  { id: 's9', slot: 'snack', name: 'Taho (less syrup)', desc: '1 small cup.', kcal: 150, p: 8, c: 25, f: 3, main: 'tofu', budget: 'low', tags: ['taho', 'tofu', 'soy'] },
  { id: 's10', slot: 'snack', name: 'Boiled corn', desc: '1 small ear.', kcal: 90, p: 3, c: 19, f: 1, main: 'corn', budget: 'low', tags: ['corn'] },
  { id: 's11', slot: 'snack', name: 'Pandesal with peanut butter', desc: '1 pandesal with 1 tsp peanut butter.', kcal: 125, p: 4, c: 17, f: 4, main: 'bread', budget: 'low', tags: ['bread', 'pandesal', 'wheat', 'gluten', 'peanut'] },
  { id: 's12', slot: 'snack', name: 'Papaya slices', desc: '1 cup.', kcal: 60, p: 1, c: 15, f: 0, main: 'fruit', budget: 'low', tags: ['papaya'] }
];
DATA.mealById = id => DATA.MEALS.find(m => m.id === id) || null;

/* ---------- Exercises (no equipment) ----------
   type 'reps' or 'time'. amount = [beginner, building].
   time amounts are seconds unless unit:'min'.
   met = intensity value used to estimate calories. */
DATA.EXERCISES = {
  march: { name: 'March in place', area: 'Warm-up', type: 'time', amount: [60, 90], met: 3, cue: 'Lift knees toward hip height and swing your arms. Breathe steadily.' },
  arm_circles: { name: 'Arm circles', area: 'Shoulders', type: 'time', amount: [30, 45], met: 2.5, cue: 'Arms straight out to the sides. Small circles forward, then backward.' },
  step_jacks: { name: 'Step jacks (low impact)', area: 'Cardio', type: 'time', amount: [30, 45], met: 4, cue: 'Step one foot out while raising your arms overhead, step back, switch sides.' },
  wall_pushup: { name: 'Wall push-ups', area: 'Chest & arms', type: 'reps', amount: [10, 15], met: 3.8, cue: 'Hands on the wall at shoulder height. Keep your body straight, bend elbows, push back.' },
  incline_pushup: { name: 'Incline push-ups', area: 'Chest & arms', type: 'reps', amount: [8, 12], met: 3.8, cue: 'Hands on a sturdy table or bed edge. Lower your chest with a straight body.' },
  knee_pushup: { name: 'Knee push-ups', area: 'Chest & arms', type: 'reps', amount: [5, 10], met: 3.8, cue: 'Knees on the floor, hands under shoulders. Lower slowly, press up.' },
  chair_dip: { name: 'Chair triceps dips', area: 'Triceps', type: 'reps', amount: [6, 10], met: 3.8, cue: 'Use a sturdy chair against a wall. Keep knees bent and elbows pointing back.' },
  wall_angels: { name: 'Wall angels', area: 'Shoulders & posture', type: 'reps', amount: [8, 12], met: 2.5, cue: 'Back against the wall, slowly slide your arms up and down like a snow angel.' },
  shoulder_taps: { name: 'Shoulder taps (knee plank)', area: 'Arms & core', type: 'reps', amount: [10, 16], met: 3.8, cue: 'In a plank on your knees, tap each shoulder with the opposite hand. Keep hips still.' },
  superman: { name: 'Superman lifts', area: 'Back', type: 'reps', amount: [8, 12], met: 3, cue: 'Lie face down, lift arms and legs a little, hold 2 seconds, lower.' },
  squat: { name: 'Bodyweight squats', area: 'Legs & glutes', type: 'reps', amount: [10, 15], met: 5, cue: 'Feet shoulder-width apart. Sit back like into a chair, chest up, knees over toes.' },
  reverse_lunge: { name: 'Reverse lunges', area: 'Legs & glutes', type: 'reps', amount: [6, 10], perSide: true, met: 4, cue: 'Step one foot back and lower gently. Push through your front heel. Hold a wall if needed.' },
  glute_bridge: { name: 'Glute bridges', area: 'Glutes', type: 'reps', amount: [10, 15], met: 3, cue: 'Lie on your back, knees bent. Squeeze your glutes to lift hips, lower slowly.' },
  calf_raise: { name: 'Calf raises', area: 'Calves', type: 'reps', amount: [12, 20], met: 2.8, cue: 'Rise onto your toes, pause, lower slowly. Hold a wall for balance.' },
  wall_sit: { name: 'Wall sit', area: 'Legs', type: 'time', amount: [20, 40], met: 3.5, cue: 'Back flat on the wall, slide down until knees are bent (not past 90°). Hold.' },
  dead_bug: { name: 'Dead bugs', area: 'Core', type: 'reps', amount: [6, 10], perSide: true, met: 3, cue: 'On your back, arms up, knees bent. Slowly extend opposite arm and leg, keep lower back down.' },
  bird_dog: { name: 'Bird dogs', area: 'Core & back', type: 'reps', amount: [6, 10], perSide: true, met: 3, cue: 'On hands and knees, reach opposite arm and leg out, hold 2 seconds, switch.' },
  plank_knee: { name: 'Forearm plank (on knees)', area: 'Core', type: 'time', amount: [20, 30], met: 3.5, cue: 'Forearms and knees down, straight line from head to knees. Keep breathing.' },
  cat_cow: { name: 'Cat–cow stretch', area: 'Spine', type: 'reps', amount: [6, 10], met: 2.3, cue: 'On hands and knees, round your back up, then gently arch. Move with your breath.' },
  chest_stretch: { name: 'Doorway chest stretch', area: 'Chest & shoulders', type: 'time', amount: [30, 30], met: 2.3, cue: 'Forearm on a door frame, step forward gently until you feel a stretch.' },
  triceps_stretch: { name: 'Overhead triceps stretch', area: 'Arms', type: 'time', amount: [20, 30], perSide: true, met: 2.3, cue: 'Reach one hand down your back, gently press the elbow with the other hand.' },
  hamstring_stretch: { name: 'Seated hamstring stretch', area: 'Legs', type: 'time', amount: [30, 30], perSide: true, met: 2.3, cue: 'Sit with one leg straight and reach toward your toes. No bouncing.' },
  hip_flexor: { name: 'Kneeling hip flexor stretch', area: 'Hips', type: 'time', amount: [20, 30], perSide: true, met: 2.3, cue: 'Half-kneel, tuck your pelvis and shift forward gently.' },
  child_pose: { name: "Child's pose", area: 'Back & hips', type: 'time', amount: [30, 45], met: 2.3, cue: 'Knees wide, sit back on your heels, arms forward. Relax and breathe.' },
  walk: { name: 'Easy walk', area: 'Cardio', type: 'time', unit: 'min', amount: [15, 25], met: 3.3, cue: 'A relaxed walk outside or around the house, at a pace where you can still talk.' }
};

const w_ = id => ({ id, phase: 'warmup' });
const m_ = id => ({ id, phase: 'main' });
const c_ = id => ({ id, phase: 'cooldown' });

/* Weekly plan: keys are day numbers (0 = Sunday). */
DATA.WEEK_PLAN = {
  1: { title: 'Upper body & arms', focus: 'Push-ups, triceps and shoulders', items: [w_('march'), w_('arm_circles'), m_('wall_pushup'), m_('chair_dip'), m_('wall_angels'), m_('shoulder_taps'), m_('superman'), c_('chest_stretch'), c_('triceps_stretch')] },
  2: { title: 'Lower body & core', focus: 'Legs, glutes and a steady core', items: [w_('march'), w_('arm_circles'), m_('squat'), m_('glute_bridge'), m_('reverse_lunge'), m_('dead_bug'), m_('calf_raise'), c_('hamstring_stretch'), c_('hip_flexor')] },
  3: { title: 'Full body + arms', focus: 'A bit of everything, extra arm work', items: [w_('step_jacks'), w_('arm_circles'), m_('knee_pushup'), m_('squat'), m_('chair_dip'), m_('bird_dog'), m_('glute_bridge'), m_('plank_knee'), c_('child_pose'), c_('chest_stretch')] },
  4: { title: 'Recovery & mobility', focus: 'Gentle movement to help you recover', recovery: true, items: [w_('march'), m_('cat_cow'), m_('wall_angels'), m_('glute_bridge'), m_('bird_dog'), m_('arm_circles'), c_('child_pose'), c_('hamstring_stretch')] },
  5: { title: 'Arms & core', focus: 'Upper-body strength and core control', items: [w_('arm_circles'), w_('step_jacks'), m_('incline_pushup'), m_('chair_dip'), m_('shoulder_taps'), m_('dead_bug'), m_('wall_sit'), m_('superman'), c_('triceps_stretch'), c_('child_pose')] },
  6: { title: 'Optional light day', focus: 'A walk and some stretching if you feel like it', optional: true, recovery: true, items: [m_('walk'), c_('cat_cow'), c_('hamstring_stretch'), c_('chest_stretch')] },
  0: { title: 'Rest day', focus: 'Rest helps your muscles get stronger', rest: true, items: [] }
};

/* ---------- Cycle options ---------- */
DATA.FLOWS = ['', 'Spotting', 'Light', 'Medium', 'Heavy'];
DATA.CRAMPS = ['None', 'Mild', 'Moderate', 'Severe'];
DATA.SYMPTOMS = ['Headache', 'Bloating', 'Back pain', 'Breast tenderness', 'Acne', 'Fatigue', 'Nausea', 'Trouble sleeping'];
DATA.MOODS = ['Happy', 'Calm', 'Sensitive', 'Irritable', 'Anxious', 'Low'];
DATA.GOALS = ['Lose body fat gradually', 'Build arm & upper-body strength', 'More energy', 'Drink more water', 'Understand my cycle', 'Build healthy habits'];
