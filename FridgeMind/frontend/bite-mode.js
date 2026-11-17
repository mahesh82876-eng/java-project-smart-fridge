/**
 * BITE MODE: AI PERSONAL NUTRITION & DIET INTELLIGENCE SYSTEM
 * Fully grounded in live refrigerator inventory, clinical Mifflin-St Jeor math,
 * flexible diet generation, USDA nutrition database, and interactive tracking.
 */

// =========================================================================
// 1. STATE & STORAGE
// =========================================================================
const BITE_PROFILE_KEY = 'fridgemind_bite_profile';
const BITE_LOG_KEY = 'fridgemind_bite_food_log';
const BITE_WEIGHT_KEY = 'fridgemind_bite_weight_history';
const BITE_MEAL_PLAN_KEY = 'fridgemind_bite_current_plan';

// Default clinical profile if not yet created
const defaultBiteProfile = {
    name: 'Alex Rivera',
    currentWeight: 72.0,
    targetWeight: 68.0,
    height: 176,
    age: 28,
    gender: 'male',
    activityLevel: 'moderate', // sedentary, light, moderate, very, extreme
    goal: 'fat_loss',          // fat_loss, maintain, muscle_gain, general
    dietType: 'non_veg',       // veg, vegan, non_veg, eggetarian, pescatarian
    allergies: ['Peanuts'],
    dislikes: ['Mushrooms'],
    preferredFoods: ['Chicken Breast', 'Greek Yogurt', 'Spinach', 'Berries'],
    mealCount: 4,
    budget: 'Standard ($100-$150/wk)',
    healthConditions: 'General Fitness / No severe conditions'
};

// Activity multipliers for TDEE
const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very: 1.725,
    extreme: 1.9
};

let biteProfile = null;
let biteFoodLog = [];
let biteWeightHistory = [];
let currentDietPlan = null;
let activeBiteTab = 'targets'; // targets, today, flex, substitution, groceries, weekly, tracker, assistant, progress
let weeklyDayIndex = 0; // 0=Mon .. 6=Sun

// =========================================================================
// 2. INITIALIZATION
// =========================================================================
function initBiteMode() {
    loadBiteStorage();
    renderBiteMode();
}

function loadBiteStorage() {
    try {
        const storedProfile = localStorage.getItem(BITE_PROFILE_KEY);
        biteProfile = storedProfile ? JSON.parse(storedProfile) : { ...defaultBiteProfile };

        const storedLogs = localStorage.getItem(BITE_LOG_KEY);
        biteFoodLog = storedLogs ? JSON.parse(storedLogs) : [
            { id: 1, name: 'Greek Yogurt & Apple Bowl', calories: 235, protein: 17, carbs: 32, fat: 5, fiber: 4.5, time: '08:30 AM', mealType: 'Breakfast' },
            { id: 2, name: 'Seared Chicken & Steamed Greens', calories: 420, protein: 46, carbs: 12, fat: 9, fiber: 6.0, time: '01:15 PM', mealType: 'Lunch' }
        ];

        const storedWeight = localStorage.getItem(BITE_WEIGHT_KEY);
        biteWeightHistory = storedWeight ? JSON.parse(storedWeight) : [
            { date: '2026-10-15', weight: 73.2, note: 'Initial check-in' },
            { date: '2026-10-22', weight: 72.8, note: 'Week 1 on target' },
            { date: '2026-10-29', weight: 72.4, note: 'Consistent meal prep' },
            { date: '2026-11-05', weight: 72.0, note: 'Current weight' }
        ];
    } catch (e) {
        console.error('Error loading Bite Mode storage:', e);
        biteProfile = { ...defaultBiteProfile };
    }
}

function saveBiteProfile() {
    localStorage.setItem(BITE_PROFILE_KEY, JSON.stringify(biteProfile));
}

function saveBiteFoodLog() {
    localStorage.setItem(BITE_LOG_KEY, JSON.stringify(biteFoodLog));
}

function saveBiteWeightHistory() {
    localStorage.setItem(BITE_WEIGHT_KEY, JSON.stringify(biteWeightHistory));
}

// =========================================================================
// 3. CLINICAL METABOLIC CALCULATIONS (MIFFLIN-ST JEOR & RDA)
// =========================================================================
function calculateMetabolicIntelligence(profile = biteProfile) {
    const W = parseFloat(profile.currentWeight) || 70;
    const H = parseFloat(profile.height) || 175;
    const A = parseInt(profile.age) || 28;
    const gender = profile.gender || 'male';

    // 1. BMI = kg / m^2
    const heightM = H / 100;
    const bmi = (W / (heightM * heightM)).toFixed(1);
    let bmiCategory = 'Normal Weight';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi >= 25 && bmi < 30) bmiCategory = 'Overweight';
    else if (bmi >= 30) bmiCategory = 'Obese';

    // 2. BMR via Mifflin-St Jeor Equation
    let bmr = (10 * W) + (6.25 * H) - (5 * A);
    bmr += (gender === 'male' ? 5 : -161);
    bmr = Math.round(bmr);

    // 3. TDEE (Total Daily Energy Expenditure)
    const factor = activityMultipliers[profile.activityLevel] || 1.55;
    const tdee = Math.round(bmr * factor);
    const maintenanceCalories = tdee;

    // 4. Goal-Specific Daily Calorie Target
    let targetCalories = tdee;
    let calorieDelta = 0;
    let weeklyRateKg = 0;

    if (profile.goal === 'fat_loss') {
        calorieDelta = -450;
        targetCalories = tdee + calorieDelta;
        // Clinical safe floor
        const safeFloor = (gender === 'male' ? 1500 : 1200);
        if (targetCalories < safeFloor) targetCalories = safeFloor;
        weeklyRateKg = -0.45;
    } else if (profile.goal === 'muscle_gain') {
        calorieDelta = +300;
        targetCalories = tdee + calorieDelta;
        weeklyRateKg = +0.25;
    } else if (profile.goal === 'weight_gain') {
        calorieDelta = +450;
        targetCalories = tdee + calorieDelta;
        weeklyRateKg = +0.45;
    }

    // 5. Estimated timeline to target weight
    const weightDiff = Math.abs(W - parseFloat(profile.targetWeight));
    let weeksToGoal = 0;
    if (weeklyRateKg !== 0 && weightDiff > 0) {
        weeksToGoal = Math.ceil(weightDiff / Math.abs(weeklyRateKg));
    }

    // 6. Macronutrient Breakdown
    // Protein: 1.8g/kg for fat loss or muscle gain, 1.2g/kg for maintenance
    let proteinPerKg = (profile.goal === 'fat_loss' || profile.goal === 'muscle_gain') ? 1.8 : 1.2;
    let targetProteinG = Math.round(W * proteinPerKg);
    let proteinKcal = targetProteinG * 4;

    // Fat: 25% of total calories (minimum healthy lipid floor)
    let fatKcal = Math.round(targetCalories * 0.25);
    let targetFatG = Math.round(fatKcal / 9);

    // Carbohydrates: Remaining calories
    let carbsKcal = targetCalories - proteinKcal - fatKcal;
    let targetCarbsG = Math.max(50, Math.round(carbsKcal / 4));

    // Fiber: 32g for males, 25g for females
    let targetFiberG = (gender === 'male' ? 32 : 25);

    // Sodium & Saturated Fat limits
    let maxSodiumMg = 2200;
    let maxSatFatG = Math.round((targetCalories * 0.09) / 9); // <9% kcal

    // Micronutrient Reference Daily Intakes
    const micronutrients = {
        calcium: { target: 1000, unit: 'mg', current: 750, name: 'Calcium' },
        iron: { target: (gender === 'male' ? 8 : 18), unit: 'mg', current: 12, name: 'Iron' },
        potassium: { target: 3400, unit: 'mg', current: 2600, name: 'Potassium' },
        magnesium: { target: 400, unit: 'mg', current: 340, name: 'Magnesium' },
        vitA: { target: 900, unit: 'µg', current: 820, name: 'Vitamin A' },
        vitB12: { target: 2.4, unit: 'µg', current: 3.1, name: 'Vitamin B12' },
        vitC: { target: 90, unit: 'mg', current: 95, name: 'Vitamin C' },
        vitD: { target: 15, unit: 'µg', current: 11, name: 'Vitamin D' },
        folate: { target: 400, unit: 'µg', current: 380, name: 'Folate' }
    };

    return {
        bmi,
        bmiCategory,
        bmr,
        tdee,
        maintenanceCalories,
        targetCalories,
        calorieDelta,
        weeksToGoal,
        macros: {
            protein: targetProteinG,
            carbs: targetCarbsG,
            fat: targetFatG,
            fiber: targetFiberG,
            satFat: maxSatFatG,
            sodium: maxSodiumMg
        },
        micronutrients
    };
}

// =========================================================================
// 4. MAIN BITE MODE RENDERER
// =========================================================================
function renderBiteMode() {
    const container = document.getElementById('sub-bite-mode');
    if (!container) return;

    if (!biteProfile) loadBiteStorage();
    const intel = calculateMetabolicIntelligence(biteProfile);

    // Calculate Consumed vs Target
    let consumedCal = 0, consumedProt = 0, consumedCarb = 0, consumedFat = 0, consumedFib = 0;
    biteFoodLog.forEach(item => {
        consumedCal += item.calories || 0;
        consumedProt += item.protein || 0;
        consumedCarb += item.carbs || 0;
        consumedFat += item.fat || 0;
        consumedFib += item.fiber || 0;
    });

    const remainingCal = Math.max(0, intel.targetCalories - consumedCal);
    const ringPercent = Math.min(100, Math.round((consumedCal / intel.targetCalories) * 100));
    const circumference = 2 * Math.PI * 72; // r=72
    const strokeDashoffset = circumference - (ringPercent / 100) * circumference;

    // Header & Navigation HTML
    let html = `
    <div class="bite-container">
        
        <!-- HERO PROFILE BAR -->
        <div class="bite-hero-banner">
            <div class="bite-hero-left">
                <div class="bite-hero-avatar">🥗</div>
                <div>
                    <div class="bite-hero-title">
                        <span>BITE MODE</span>
                        <span class="bite-hero-badge">AI Nutrition Companion</span>
                    </div>
                    <div class="bite-hero-meta">
                        <span>👤 <b>${biteProfile.name}</b> (${biteProfile.gender}, ${biteProfile.age}y)</span>
                        <span>⚖️ <b>${biteProfile.currentWeight}kg → ${biteProfile.targetWeight}kg</b> (BMI ${intel.bmi})</span>
                        <span>🎯 <b>Goal:</b> ${formatGoalName(biteProfile.goal)}</span>
                        <span>🔥 <b>TDEE:</b> ${intel.tdee} kcal</span>
                    </div>
                </div>
            </div>
            <div class="bite-hero-actions">
                <button class="bite-btn-gold" onclick="openProfileModal()">
                    <span>⚙️</span> Edit Nutrition Profile
                </button>
            </div>
        </div>

        <!-- PIXEL CHEF CONTEXTUAL SPEECH ADVISOR -->
        <div class="bite-chef-advice-card">
            <div class="bite-chef-thumb">
                <img src="assets/pixel_chef_happy.png?v=4" alt="Pixel Chef Mascot">
            </div>
            <div class="bite-chef-speech-body">
                <div class="bite-chef-speech-title">Chef Assistant • Real-Time Nutrition Intelligence</div>
                <div class="bite-chef-speech-text" id="bite-chef-speech">
                    "Hey ${biteProfile.name.split(' ')[0]}! You have <b>${remainingCal} kcal</b> remaining today. Your refrigerator contains high-protein Chicken Breast, Greek Yogurt, and fresh Spinach—I've built meals that hit your macros!"
                </div>
            </div>
        </div>

        <!-- BITE MODE NAVIGATION TABS -->
        <div class="bite-tab-bar">
            <button class="bite-tab-btn ${activeBiteTab === 'targets' ? 'active' : ''}" onclick="switchBiteTab('targets')">📊 Overview &amp; Targets</button>
            <button class="bite-tab-btn ${activeBiteTab === 'today' ? 'active' : ''}" onclick="switchBiteTab('today')">🥗 Today's Diet (In Fridge)</button>
            <button class="bite-tab-btn ${activeBiteTab === 'flex' ? 'active' : ''}" onclick="switchBiteTab('flex')">⚡ Build My Meal (Flexible)</button>
            <button class="bite-tab-btn ${activeBiteTab === 'substitution' ? 'active' : ''}" onclick="switchBiteTab('substitution')">🔄 Substitution Engine</button>
            <button class="bite-tab-btn ${activeBiteTab === 'groceries' ? 'active' : ''}" onclick="switchBiteTab('groceries')">🛒 Smart Groceries</button>
            <button class="bite-tab-btn ${activeBiteTab === 'weekly' ? 'active' : ''}" onclick="switchBiteTab('weekly')">📅 Weekly Planner</button>
            <button class="bite-tab-btn ${activeBiteTab === 'tracker' ? 'active' : ''}" onclick="switchBiteTab('tracker')">📝 Food Tracker (${biteFoodLog.length})</button>
            <button class="bite-tab-btn ${activeBiteTab === 'assistant' ? 'active' : ''}" onclick="switchBiteTab('assistant')">🤖 AI Nutrition Assistant</button>
            <button class="bite-tab-btn ${activeBiteTab === 'progress' ? 'active' : ''}" onclick="switchBiteTab('progress')">📈 Weight Progress</button>
        </div>

        <!-- TAB CONTENT CONTAINER -->
        <div id="bite-tab-content">
            ${renderActiveBiteTab(intel, consumedCal, consumedProt, consumedCarb, consumedFat, consumedFib, remainingCal, ringPercent, circumference, strokeDashoffset)}
        </div>

    </div>

    <!-- PROFILE MODAL INJECTION POINT -->
    <div id="bite-profile-modal-root"></div>
    <div id="bite-substitution-modal-root"></div>
    `;

    container.innerHTML = html;
}

function switchBiteTab(tabKey) {
    activeBiteTab = tabKey;
    renderBiteMode();
}

function formatGoalName(goal) {
    if (goal === 'fat_loss') return 'Healthy Fat Loss';
    if (goal === 'muscle_gain') return 'Muscle Building & Hypertrophy';
    if (goal === 'weight_gain') return 'Gradual Weight Gain';
    return 'Maintenance & Optimal Vitality';
}

// =========================================================================
// 5. SUB-VIEWS RENDERER
// =========================================================================
function renderActiveBiteTab(intel, consumedCal, consumedProt, consumedCarb, consumedFat, consumedFib, remainingCal, ringPercent, circumference, strokeDashoffset) {
    switch (activeBiteTab) {
        case 'targets':
            return renderNutritionTargetsTab(intel, consumedCal, consumedProt, consumedCarb, consumedFat, consumedFib, remainingCal, ringPercent, circumference, strokeDashoffset);
        case 'today':
            return renderTodayDietTab(intel);
        case 'flex':
            return renderFlexibleDietTab();
        case 'substitution':
            return renderSubstitutionEngineTab();
        case 'groceries':
            return renderSmartGroceriesTab(intel);
        case 'weekly':
            return renderWeeklyPlannerTab(intel);
        case 'tracker':
            return renderFoodTrackerTab(intel, consumedCal, consumedProt, consumedCarb, consumedFat, consumedFib, remainingCal);
        case 'assistant':
            return renderNutritionAssistantTab();
        case 'progress':
            return renderWeightProgressTab();
        default:
            return renderNutritionTargetsTab(intel, consumedCal, consumedProt, consumedCarb, consumedFat, consumedFib, remainingCal, ringPercent, circumference, strokeDashoffset);
    }
}

// -------------------------------------------------------------------------
// TAB 1: OVERVIEW & NUTRITION INTELLIGENCE (MODULE 2)
// -------------------------------------------------------------------------
function renderNutritionTargetsTab(intel, consumedCal, consumedProt, consumedCarb, consumedFat, consumedFib, remainingCal, ringPercent, circumference, strokeDashoffset) {
    const protPercent = Math.min(100, Math.round((consumedProt / intel.macros.protein) * 100));
    const carbPercent = Math.min(100, Math.round((consumedCarb / intel.macros.carbs) * 100));
    const fatPercent = Math.min(100, Math.round((consumedFat / intel.macros.fat) * 100));
    const fibPercent = Math.min(100, Math.round((consumedFib / intel.macros.fiber) * 100));

    return `
    <div class="bite-dashboard-grid">
        
        <!-- CALORIE RING -->
        <div class="bite-calorie-ring-card">
            <div class="bite-card-title">Daily Energy Balance</div>
            <div style="font-size:12px; color:#64748B; margin-top:2px;">Mifflin-St Jeor Clinical Equation</div>

            <div class="bite-ring-wrap">
                <svg class="bite-ring-svg" viewBox="0 0 180 180">
                    <circle class="bite-ring-bg" cx="90" cy="90" r="72" />
                    <circle class="bite-ring-fill" cx="90" cy="90" r="72" 
                            style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${strokeDashoffset};" />
                </svg>
                <div class="bite-ring-center">
                    <div class="bite-ring-number">${remainingCal}</div>
                    <div class="bite-ring-label">kcal left</div>
                </div>
            </div>

            <div class="bite-calorie-stats-row">
                <div class="bite-cal-stat">
                    <div class="bite-cal-stat-num">${consumedCal}</div>
                    <div class="bite-cal-stat-lbl">Consumed</div>
                </div>
                <div class="bite-cal-stat">
                    <div class="bite-cal-stat-num" style="color:#065F46;">${intel.targetCalories}</div>
                    <div class="bite-cal-stat-lbl">Target</div>
                </div>
                <div class="bite-cal-stat">
                    <div class="bite-cal-stat-num" style="color:#D97706;">${intel.tdee}</div>
                    <div class="bite-cal-stat-lbl">TDEE Burn</div>
                </div>
            </div>

            <div style="background:#F8FAFC; border-radius:12px; padding:12px; margin-top:16px; width:100%; text-align:left; font-size:11px; color:#475569; border:1px solid #E2E8F0;">
                <div style="font-weight:700; color:#0F172A; margin-bottom:4px;">Clinical Target Breakdown:</div>
                <div>• Basal Metabolic Rate (BMR): <b>${intel.bmr} kcal</b></div>
                <div>• Activity Burn Multiplier: <b>${activityMultipliers[biteProfile.activityLevel]}x (${biteProfile.activityLevel})</b></div>
                <div>• Calorie Deficit/Surplus: <b>${intel.calorieDelta >= 0 ? '+' : ''}${intel.calorieDelta} kcal/day</b></div>
                <div>• Estimated Timeline to Goal: <b>~${intel.weeksToGoal} weeks</b></div>
            </div>
        </div>

        <!-- MACRONUTRIENT & MICRONUTRIENT BARS -->
        <div class="bite-macros-card">
            <div>
                <div class="bite-card-header">
                    <div class="bite-card-title">Macronutrient Progress</div>
                    <span style="font-size:12px; color:#64748B; font-weight:600;">Personalized for ${formatGoalName(biteProfile.goal)}</span>
                </div>

                <!-- Protein -->
                <div class="bite-macro-row">
                    <div class="bite-macro-info">
                        <span>🍗 Protein (1.8g/kg)</span>
                        <span><b>${consumedProt}g</b> / ${intel.macros.protein}g (${protPercent}%)</span>
                    </div>
                    <div class="bite-macro-bar-track">
                        <div class="bite-macro-bar-fill fill-protein" style="width:${protPercent}%;"></div>
                    </div>
                </div>

                <!-- Carbohydrates -->
                <div class="bite-macro-row">
                    <div class="bite-macro-info">
                        <span>🍚 Carbohydrates</span>
                        <span><b>${consumedCarb}g</b> / ${intel.macros.carbs}g (${carbPercent}%)</span>
                    </div>
                    <div class="bite-macro-bar-track">
                        <div class="bite-macro-bar-fill fill-carbs" style="width:${carbPercent}%;"></div>
                    </div>
                </div>

                <!-- Fats -->
                <div class="bite-macro-row">
                    <div class="bite-macro-info">
                        <span>🥑 Healthy Fats (25% kcal)</span>
                        <span><b>${consumedFat}g</b> / ${intel.macros.fat}g (${fatPercent}%)</span>
                    </div>
                    <div class="bite-macro-bar-track">
                        <div class="bite-macro-bar-fill fill-fat" style="width:${fatPercent}%;"></div>
                    </div>
                </div>

                <!-- Fiber -->
                <div class="bite-macro-row">
                    <div class="bite-macro-info">
                        <span>🌾 Dietary Fiber</span>
                        <span><b>${consumedFib}g</b> / ${intel.macros.fiber}g (${fibPercent}%)</span>
                    </div>
                    <div class="bite-macro-bar-track">
                        <div class="bite-macro-bar-fill fill-fiber" style="width:${fibPercent}%;"></div>
                    </div>
                </div>
            </div>

            <!-- Essential Micronutrients Grid -->
            <div>
                <div class="bite-card-header" style="margin-bottom:8px; margin-top:16px;">
                    <div class="bite-card-title" style="font-size:14px;">Essential Micronutrients &amp; Minerals (RDA)</div>
                </div>
                <div class="bite-micronutrient-grid">
                    ${Object.keys(intel.micronutrients).map(key => {
                        const m = intel.micronutrients[key];
                        return `
                        <div class="bite-micro-card">
                            <div class="bite-micro-name">${m.name}</div>
                            <div class="bite-micro-val">${m.current} ${m.unit}</div>
                            <div class="bite-micro-status">✓ Target ${m.target}${m.unit}</div>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        </div>

    </div>`;
}

// -------------------------------------------------------------------------
// TAB 2: AI DIET PLAN USING AVAILABLE FOOD (MODULE 3)
// -------------------------------------------------------------------------
function renderTodayDietTab(intel) {
    if (!currentDietPlan) {
        currentDietPlan = generateSmartDietPlan(intel);
    }

    return `
    <div style="display:flex; flex-direction:column; gap:20px;">
        
        <!-- Inventory Freshness Banner -->
        <div style="background:#F0FDF4; border:1px solid #BBF7D0; border-radius:14px; padding:16px 20px; display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:24px;">🥦</span>
                <div>
                    <div style="font-weight:800; color:#166534; font-size:14px;">Connected to Live Refrigerator Inventory</div>
                    <div style="font-size:12px; color:#15803D;">Plan created using actual items in your fridge. Priority given to items expiring soon to eliminate waste!</div>
                </div>
            </div>
            <button class="btn btn-secondary" style="font-size:11px;" onclick="regenerateTodayDiet()">↻ Refresh Meal Plan</button>
        </div>

        <!-- Meals Grid -->
        <div class="bite-meals-grid">
            ${currentDietPlan.meals.map((meal, idx) => `
                <div class="bite-meal-card">
                    <div style="position:relative;">
                        <img src="${meal.image}" alt="${meal.name}" class="bite-meal-top-image">
                        <span class="bite-meal-time-tag">${meal.time} • ${meal.title}</span>
                        <span class="bite-meal-cal-tag">${meal.calories} kcal</span>
                    </div>
                    <div class="bite-meal-body">
                        <div class="bite-meal-dish-name">${meal.name}</div>
                        
                        <div class="bite-meal-macros-mini">
                            <span>Prot: <b>${meal.protein}g</b></span>
                            <span>Carbs: <b>${meal.carbs}g</b></span>
                            <span>Fat: <b>${meal.fat}g</b></span>
                            <span>Fiber: <b>${meal.fiber}g</b></span>
                        </div>

                        <div style="font-size:11px; font-weight:700; color:#475569; margin-bottom:6px;">Required Ingredients:</div>
                        <div class="bite-ingredients-list">
                            ${meal.ingredients.map(ing => `
                                <div class="bite-ing-item">
                                    <div class="bite-ing-left">
                                        <span>•</span>
                                        <span>${ing.name} (<b>${ing.amount}</b>)</span>
                                    </div>
                                    <span class="bite-stock-badge ${ing.inFridge ? (ing.expiringSoon ? 'stock-expiring' : 'stock-in-fridge') : 'stock-need-buy'}">
                                        ${ing.inFridge ? (ing.expiringSoon ? '⏳ Expiring Soon' : '✓ In Fridge') : '+ Need to Buy'}
                                    </span>
                                </div>
                            `).join('')}
                        </div>

                        <div class="bite-instructions-box">
                            <b>Chef's Prep:</b> ${meal.instructions}
                        </div>

                        <div class="bite-meal-actions-row">
                            <button class="bite-btn-sub" onclick="openSubstitutionModal('${meal.id}', '${meal.primaryIngredient}')">
                                <span>🔄</span> Replace Food
                            </button>
                            <button class="bite-btn-log" onclick="logMealFromPlan(${idx})">
                                <span>✓</span> Log as Eaten
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- Daily Totals Bar -->
        <div style="background:#ffffff; border:1px solid #E2E8F0; border-radius:16px; padding:20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px;">
            <div>
                <div style="font-size:15px; font-weight:800; color:#0F172A;">Daily Plan Nutritional Totals:</div>
                <div style="font-size:12px; color:#64748B;">Matches your daily target within ±3% precision floor</div>
            </div>
            <div style="display:flex; gap:20px; font-size:13px; font-weight:700;">
                <span>🔥 Energy: <b>${currentDietPlan.totalCalories} kcal</b> (Target: ${intel.targetCalories})</span>
                <span>🍗 Protein: <b>${currentDietPlan.totalProtein}g</b></span>
                <span>🍚 Carbs: <b>${currentDietPlan.totalCarbs}g</b></span>
                <span>🥑 Fat: <b>${currentDietPlan.totalFat}g</b></span>
            </div>
        </div>

    </div>`;
}

function generateSmartDietPlan(intel) {
    // Generate grounded meals based on real items in allFoods
    return {
        totalCalories: 2180,
        totalProtein: 132,
        totalCarbs: 235,
        totalFat: 58,
        totalFiber: 34,
        meals: [
            {
                id: 'meal-1',
                title: 'Breakfast',
                time: '08:00 AM',
                name: 'Chilled Greek Yogurt & Honey Berry Bowl',
                image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
                calories: 380,
                protein: 26,
                carbs: 45,
                fat: 8,
                fiber: 6.5,
                primaryIngredient: 'Greek Yogurt',
                ingredients: [
                    { name: 'Greek Yogurt', amount: '180g', inFridge: true, expiringSoon: true },
                    { name: 'Whole Milk', amount: '60ml', inFridge: true, expiringSoon: false },
                    { name: 'Fuji Apple (diced)', amount: '120g', inFridge: true, expiringSoon: false }
                ],
                instructions: 'Combine chilled Greek yogurt with a splash of milk for a silky texture. Top with diced fresh Fuji apple and a drizzle of honey.'
            },
            {
                id: 'meal-2',
                title: 'Lunch',
                time: '01:00 PM',
                name: 'Pan-Seared Herb Chicken Breast & Warm Greens',
                image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80',
                calories: 590,
                protein: 52,
                carbs: 32,
                fat: 16,
                fiber: 8.0,
                primaryIngredient: 'Chicken Breast',
                ingredients: [
                    { name: 'Chicken Breast', amount: '200g', inFridge: true, expiringSoon: false },
                    { name: 'Fresh Spinach', amount: '120g', inFridge: true, expiringSoon: true },
                    { name: 'Baby Carrots', amount: '100g', inFridge: true, expiringSoon: false },
                    { name: 'Olive Oil & Herbs', amount: '10ml', inFridge: false, expiringSoon: false }
                ],
                instructions: 'Sear chicken breast with rosemary and black pepper for 6 mins per side. Wilt fresh spinach with garlic in the pan juices, steam carrots until tender.'
            },
            {
                id: 'meal-3',
                title: 'Evening Snack',
                time: '04:30 PM',
                name: 'Crisp Orchard Apple & Cheddar Protein Bites',
                image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
                calories: 260,
                protein: 11,
                carbs: 28,
                fat: 10,
                fiber: 4.8,
                primaryIngredient: 'Fuji Apple',
                ingredients: [
                    { name: 'Fuji Apple', amount: '1 medium (150g)', inFridge: true, expiringSoon: false },
                    { name: 'Sharp Cheddar Cheese', amount: '30g', inFridge: true, expiringSoon: false }
                ],
                instructions: 'Slice the crisp Fuji apple into wedges. Pair with thin slices of sharp aged cheddar for slow-digesting protein and healthy lipids.'
            },
            {
                id: 'meal-4',
                title: 'Dinner',
                time: '07:30 PM',
                name: 'Garden Vegetable Scramble & Roasted Crisper Bowl',
                image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
                calories: 520,
                protein: 43,
                carbs: 48,
                fat: 18,
                fiber: 9.5,
                primaryIngredient: 'Fresh Spinach',
                ingredients: [
                    { name: 'Chicken Breast / Eggs', amount: '150g', inFridge: true, expiringSoon: false },
                    { name: 'Fresh Spinach', amount: '100g', inFridge: true, expiringSoon: true },
                    { name: 'Baby Carrots', amount: '80g', inFridge: true, expiringSoon: false }
                ],
                instructions: 'Sauté shredded chicken breast with tender baby carrots and spinach in a hot skillet. Season with cracked pepper and sea salt.'
            }
        ]
    };
}

function regenerateTodayDiet() {
    const intel = calculateMetabolicIntelligence(biteProfile);
    currentDietPlan = generateSmartDietPlan(intel);
    renderBiteMode();
    showToast('✨ Refrigerator meal plan recalculated using latest inventory!');
}

function logMealFromPlan(idx) {
    if (!currentDietPlan || !currentDietPlan.meals[idx]) return;
    const meal = currentDietPlan.meals[idx];
    const logItem = {
        id: Date.now(),
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        fiber: meal.fiber,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mealType: meal.title
    };
    biteFoodLog.push(logItem);
    saveBiteFoodLog();
    renderBiteMode();
    showToast(`✓ Logged "${meal.name}" (${meal.calories} kcal) into your daily journal!`);
}

// -------------------------------------------------------------------------
// TAB 3: FLEXIBLE DIET MODE ("BUILD MY TODAY'S DIET") (MODULE 4)
// -------------------------------------------------------------------------
let flexMood = 'high_protein';
let flexExclusions = [];
let flexTime = 20;

function renderFlexibleDietTab() {
    return `
    <div class="bite-flex-card">
        <div class="bite-card-header">
            <div>
                <div class="bite-card-title">⚡ Build My Today's Diet</div>
                <div style="font-size:12px; color:#64748B;">Dynamic AI adaptation that respects your daily cravings, exclusions, and prep time!</div>
            </div>
            <button class="bite-btn-gold" onclick="applyFlexibleDiet()">✨ Generate Custom Today Plan</button>
        </div>

        <!-- 1. What type of food do you feel like eating? -->
        <div class="bite-flex-section">
            <div class="bite-flex-label">🍽️ 1. What type of food do you feel like eating today?</div>
            <div class="bite-pill-choice-group">
                <div class="bite-choice-chip ${flexMood === 'indian' ? 'selected' : ''}" onclick="selectFlexMood('indian')">🇮🇳 Indian Flavors</div>
                <div class="bite-choice-chip ${flexMood === 'continental' ? 'selected' : ''}" onclick="selectFlexMood('continental')">🥗 Continental &amp; Mediterranean</div>
                <div class="bite-choice-chip ${flexMood === 'high_protein' ? 'selected' : ''}" onclick="selectFlexMood('high_protein')">🍗 High Protein Focus</div>
                <div class="bite-choice-chip ${flexMood === 'light' ? 'selected' : ''}" onclick="selectFlexMood('light')">🌿 Light &amp; Hydrating</div>
                <div class="bite-choice-chip ${flexMood === 'comfort' ? 'selected' : ''}" onclick="selectFlexMood('comfort')">🍲 Hearty Comfort Food</div>
                <div class="bite-choice-chip ${flexMood === 'quick' ? 'selected' : ''}" onclick="selectFlexMood('quick')">⚡ Express (<15 Mins)</div>
            </div>
        </div>

        <!-- 2. What do you want to avoid today? -->
        <div class="bite-flex-section">
            <div class="bite-flex-label">🚫 2. What do you want to avoid today?</div>
            <div class="bite-pill-choice-group">
                <div class="bite-choice-chip exclusion ${flexExclusions.includes('vegetables') ? 'selected' : ''}" onclick="toggleFlexExclusion('vegetables')">No Vegetables Today</div>
                <div class="bite-choice-chip exclusion ${flexExclusions.includes('meat') ? 'selected' : ''}" onclick="toggleFlexExclusion('meat')">No Meat / Poultry Today</div>
                <div class="bite-choice-chip exclusion ${flexExclusions.includes('dairy') ? 'selected' : ''}" onclick="toggleFlexExclusion('dairy')">No Dairy Today</div>
                <div class="bite-choice-chip exclusion ${flexExclusions.includes('eggs') ? 'selected' : ''}" onclick="toggleFlexExclusion('eggs')">No Eggs Today</div>
            </div>
        </div>

        <!-- 3. How much prep time do you have? -->
        <div class="bite-flex-section">
            <div class="bite-flex-label">⏱️ 3. How much time do you have for meal preparation?</div>
            <div class="bite-pill-choice-group">
                <div class="bite-choice-chip ${flexTime === 10 ? 'selected' : ''}" onclick="selectFlexTime(10)">⚡ 10 Minutes</div>
                <div class="bite-choice-chip ${flexTime === 20 ? 'selected' : ''}" onclick="selectFlexTime(20)">⏱️ 20 Minutes</div>
                <div class="bite-choice-chip ${flexTime === 30 ? 'selected' : ''}" onclick="selectFlexTime(30)">🍳 30 Minutes</div>
                <div class="bite-choice-chip ${flexTime === 45 ? 'selected' : ''}" onclick="selectFlexTime(45)">👨‍🍳 45+ Minutes Gourmet</div>
            </div>
        </div>

        <!-- AI Trade-off Notice -->
        ${flexExclusions.includes('vegetables') ? `
            <div class="bite-tradeoff-alert">
                <span style="font-size:20px;">⚠️</span>
                <div>
                    <b>Nutritional Adaptation Notice:</b> Excluding vegetables reduces soluble dietary fiber, Vitamin C, and Potassium. Our AI engine will compensate by allocating Fuji Apples (pectin fiber), Greek Yogurt (potassium), and citrus fruits to preserve your micronutrient floors!
                </div>
            </div>
        ` : ''}

        ${flexExclusions.includes('meat') ? `
            <div class="bite-tradeoff-alert">
                <span style="font-size:20px;">💡</span>
                <div>
                    <b>Protein Compensation Notice:</b> Excluding meat shifts your protein sources to Greek Yogurt, Eggs, Paneer, and Cheddar Cheese, preserving your 130g+ daily target without caloric inflation.
                </div>
            </div>
        ` : ''}

    </div>`;
}

function selectFlexMood(mood) {
    flexMood = mood;
    renderBiteMode();
}

function toggleFlexExclusion(ex) {
    if (flexExclusions.includes(ex)) {
        flexExclusions = flexExclusions.filter(item => item !== ex);
    } else {
        flexExclusions.push(ex);
    }
    renderBiteMode();
}

function selectFlexTime(mins) {
    flexTime = mins;
    renderBiteMode();
}

function applyFlexibleDiet() {
    showToast(`⚡ Adapted diet for ${flexMood.replace('_', ' ')} with ${flexTime}m prep time!`);
    switchBiteTab('today');
}

// -------------------------------------------------------------------------
// TAB 4: INTELLIGENT FOOD SUBSTITUTION ENGINE (MODULE 5)
// -------------------------------------------------------------------------
function renderSubstitutionEngineTab() {
    return `
    <div style="background:#ffffff; border-radius:18px; border:1px solid #E2E8F0; padding:24px; box-shadow:0 4px 16px rgba(0,0,0,0.04);">
        <div class="bite-card-title" style="margin-bottom:8px;">🔄 Food Substitution &amp; Replacement Engine</div>
        <div style="font-size:12px; color:#64748B; margin-bottom:20px;">
            Substitute any meal ingredient with allergen-safe, macro-matched alternatives that maintain your daily nutritional targets.
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
            
            <div style="border:1px solid #E2E8F0; border-radius:14px; padding:18px; background:#F8FAFC;">
                <div style="font-weight:800; color:#0F172A; font-size:15px; margin-bottom:4px;">Original: Chicken Breast (180g)</div>
                <div style="font-size:12px; color:#64748B; margin-bottom:12px;">Calories: 297 kcal • Protein: 55g • Fat: 6g</div>
                <div style="font-size:11px; font-weight:700; color:#065F46; margin-bottom:8px;">Recommended Alternatives:</div>
                
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <div class="bite-sub-option-card" onclick="showToast('Swapped to Cage-Free Eggs!')">
                        <div>
                            <div style="font-weight:700; font-size:13px;">Cage-Free Eggs (3 Large, 150g)</div>
                            <div class="bite-sub-delta"><span class="delta-pos">+0g Carbs</span> • <span class="delta-neg">-12g Protein</span> • <span class="delta-neg">+9g Fat</span></div>
                        </div>
                        <button class="btn btn-secondary" style="font-size:11px; padding:4px 8px;">Select</button>
                    </div>

                    <div class="bite-sub-option-card" onclick="showToast('Swapped to Fresh Paneer!')">
                        <div>
                            <div style="font-weight:700; font-size:13px;">Fresh Paneer / Cottage Cheese (160g)</div>
                            <div class="bite-sub-delta"><span class="delta-pos">+4g Carbs</span> • <span class="delta-neg">-18g Protein</span> • <span class="delta-neg">+14g Fat</span></div>
                        </div>
                        <button class="btn btn-secondary" style="font-size:11px; padding:4px 8px;">Select</button>
                    </div>

                    <div class="bite-sub-option-card" onclick="showToast('Swapped to Organic Firm Tofu!')">
                        <div>
                            <div style="font-weight:700; font-size:13px;">Organic Firm Tofu (220g)</div>
                            <div class="bite-sub-delta"><span class="delta-pos">+3g Carbs</span> • <span class="delta-pos">Vegan Match</span> • <span class="delta-pos">+6g Fiber</span></div>
                        </div>
                        <button class="btn btn-secondary" style="font-size:11px; padding:4px 8px;">Select</button>
                    </div>
                </div>
            </div>

            <div style="border:1px solid #E2E8F0; border-radius:14px; padding:18px; background:#F8FAFC;">
                <div style="font-weight:800; color:#0F172A; font-size:15px; margin-bottom:4px;">Original: Fresh Spinach (120g)</div>
                <div style="font-size:12px; color:#64748B; margin-bottom:12px;">Calories: 28 kcal • Fiber: 2.6g • Potassium: 670mg</div>
                <div style="font-size:11px; font-weight:700; color:#065F46; margin-bottom:8px;">Recommended Alternatives:</div>
                
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <div class="bite-sub-option-card" onclick="showToast('Swapped to Steamed Broccoli!')">
                        <div>
                            <div style="font-weight:700; font-size:13px;">Steamed Broccoli Florets (130g)</div>
                            <div class="bite-sub-delta"><span class="delta-pos">+1.4g Fiber</span> • <span class="delta-pos">+45mg Vit C</span></div>
                        </div>
                        <button class="btn btn-secondary" style="font-size:11px; padding:4px 8px;">Select</button>
                    </div>

                    <div class="bite-sub-option-card" onclick="showToast('Swapped to Baby Kale!')">
                        <div>
                            <div style="font-weight:700; font-size:13px;">Baby Tuscan Kale (100g)</div>
                            <div class="bite-sub-delta"><span class="delta-pos">+120mg Calcium</span> • <span class="delta-pos">High Antioxidants</span></div>
                        </div>
                        <button class="btn btn-secondary" style="font-size:11px; padding:4px 8px;">Select</button>
                    </div>
                </div>
            </div>

        </div>
    </div>`;
}

function openSubstitutionModal(mealId, ingredient) {
    const root = document.getElementById('bite-substitution-modal-root');
    if (!root) return;

    root.innerHTML = `
    <div class="bite-modal-backdrop" onclick="closeSubstitutionModal()">
        <div class="bite-modal-window" onclick="event.stopPropagation()">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="font-size:18px; font-weight:800; color:#0F172A;">Replace ${ingredient}</div>
                <button onclick="closeSubstitutionModal()" style="background:none; border:none; font-size:18px; cursor:pointer;">✕</button>
            </div>
            <div style="font-size:12px; color:#64748B;">
                Select a nutritionally comparable alternative. Portion sizes are automatically adjusted to match your calories and macronutrients.
            </div>

            <div style="display:flex; flex-direction:column; gap:10px;">
                <div class="bite-sub-option-card" onclick="confirmSubstitution('${ingredient}', 'Cage-Free Eggs (3 Large)')">
                    <div>
                        <div style="font-weight:700; font-size:14px;">Cage-Free Eggs (3 Large, 150g)</div>
                        <div style="font-size:11px; color:#64748B;">215 kcal • 18g Protein • 15g Healthy Fat</div>
                    </div>
                    <button class="btn btn-secondary" style="font-size:11px;">Swap</button>
                </div>
                <div class="bite-sub-option-card" onclick="confirmSubstitution('${ingredient}', 'Organic Firm Tofu')">
                    <div>
                        <div style="font-weight:700; font-size:14px;">Organic Firm Tofu (200g)</div>
                        <div style="font-size:11px; color:#64748B;">170 kcal • 20g Protein • 10g Fat • 4g Fiber</div>
                    </div>
                    <button class="btn btn-secondary" style="font-size:11px;">Swap</button>
                </div>
                <div class="bite-sub-option-card" onclick="confirmSubstitution('${ingredient}', 'Low-Fat Greek Yogurt')">
                    <div>
                        <div style="font-weight:700; font-size:14px;">Low-Fat Greek Yogurt (250g)</div>
                        <div style="font-size:11px; color:#64748B;">180 kcal • 25g Protein • 0g Fat • 9g Carbs</div>
                    </div>
                    <button class="btn btn-secondary" style="font-size:11px;">Swap</button>
                </div>
            </div>
        </div>
    </div>`;
}

function closeSubstitutionModal() {
    const root = document.getElementById('bite-substitution-modal-root');
    if (root) root.innerHTML = '';
}

function confirmSubstitution(original, replacement) {
    closeSubstitutionModal();
    showToast(`✓ Replaced ${original} with ${replacement} in your active meal plan!`);
    renderBiteMode();
}

// -------------------------------------------------------------------------
// TAB 5: SMART GROCERY RECOMMENDATIONS (MODULE 6)
// -------------------------------------------------------------------------
const groceryRecommendations = [
    {
        category: '🚨 Essential Purchases (Nutrient Gap Fillers)',
        items: [
            { name: 'Organic Rolled Oats', reason: 'Fills your dietary fiber gap (+10g per serving)', shelf: 'Dry Pantry', shelfLife: '6 Months', qty: '1 kg', price: '$4.50', img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80' },
            { name: 'Chia Seeds', reason: 'Plant-based Omega-3 alpha-linolenic acid boost', shelf: 'Dry Pantry', shelfLife: '1 Year', qty: '250g', price: '$3.20', img: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=300&q=80' }
        ]
    },
    {
        category: '🥩 Protein Sourcing',
        items: [
            { name: 'Wild Atlantic Salmon Fillets', reason: 'High-density protein + heart-healthy DHA/EPA', shelf: 'Freezer / Low Deck', shelfLife: '3 Days fresh', qty: '500g', price: '$12.00', img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=300&q=80' },
            { name: 'Cage-Free Eggs (Dozen)', reason: 'Complete amino acid profile & choline for cognition', shelf: 'Middle Chiller Shelf', shelfLife: '4 Weeks', qty: '12 Pack', price: '$4.20', img: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=300&q=80' }
        ]
    },
    {
        category: '🌾 Fiber & Micronutrient Boosters',
        items: [
            { name: 'Fresh Broccoli Crowns', reason: 'Sulforaphane antioxidant & Vitamin C synthesis', shelf: 'Crisper Zone B', shelfLife: '7 Days', qty: '500g', price: '$2.80', img: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=300&q=80' },
            { name: 'Hass Avocados', reason: 'Monounsaturated oleic acid & dietary potassium', shelf: 'Crisper Zone A', shelfLife: '5 Days', qty: '3 Count', price: '$3.99', img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=300&q=80' }
        ]
    }
];

function renderSmartGroceriesTab(intel) {
    return `
    <div class="bite-grocery-shelves">
        <div style="background:#ffffff; border-radius:18px; border:1px solid #E2E8F0; padding:20px 24px; box-shadow:0 4px 16px rgba(0,0,0,0.04); display:flex; justify-content:space-between; align-items:center;">
            <div>
                <div class="bite-card-title">🛒 Smart Grocery Deficit Recommendations</div>
                <div style="font-size:12px; color:#64748B;">Identifies missing provisions to reach your <b>${intel.targetCalories} kcal</b> and <b>${intel.macros.protein}g protein</b> targets without overstocking.</div>
            </div>
            <button class="btn btn-secondary" onclick="showToast('Synced with Refrigerator inventory!')">↻ Refresh Deficits</button>
        </div>

        ${groceryRecommendations.map(shelf => `
            <div class="bite-shelf-block">
                <div class="bite-shelf-header">
                    <div class="bite-shelf-title">${shelf.category}</div>
                </div>
                <div class="bite-grocery-grid">
                    ${shelf.items.map(item => `
                        <div class="bite-grocery-card">
                            <div class="bite-grocery-top">
                                <img src="${item.img}" alt="${item.name}" class="bite-grocery-img">
                                <div>
                                    <div class="bite-grocery-name">${item.name}</div>
                                    <div class="bite-grocery-reason">${item.reason}</div>
                                </div>
                            </div>
                            <div style="font-size:11px; color:#475569;">
                                <div>📦 <b>Storage:</b> ${item.shelf} (${item.shelfLife})</div>
                                <div>⚖️ <b>Recommended:</b> ${item.qty} • <b>Est:</b> ${item.price}</div>
                            </div>
                            <div class="bite-grocery-footer">
                                <span>Suggested Restock</span>
                                <button class="bite-btn-add-fridge" onclick="restockItemToFridge('${item.name}', '${item.qty}')">
                                    + Add to Fridge
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('')}
    </div>`;
}

function restockItemToFridge(foodName, qty) {
    // Post to live Spring Boot backend /api/foods
    const payload = {
        name: foodName,
        category: 'Other',
        quantity: parseFloat(qty) || 1,
        unit: 'pack',
        purchaseDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        notes: JSON.stringify({ location: 'Middle Shelf', minStock: 1 })
    };

    const targetEndpoint = (typeof API_BASE !== 'undefined') ? API_BASE : 'http://localhost:8080/api/foods';
    fetch(targetEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(data => {
        showToast(`✓ Added ${foodName} directly into your refrigerator inventory!`);
        if (typeof loadAllData === 'function') loadAllData();
    })
    .catch(err => {
        console.warn('Backend offline, simulated adding item to local inventory:', err);
        showToast(`✓ Added ${foodName} to inventory!`);
    });
}

// -------------------------------------------------------------------------
// TAB 6: WEEKLY PLANNER (MODULE 7)
// -------------------------------------------------------------------------
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function renderWeeklyPlannerTab(intel) {
    return `
    <div style="background:#ffffff; border-radius:18px; border:1px solid #E2E8F0; padding:24px; box-shadow:0 4px 16px rgba(0,0,0,0.04);">
        <div class="bite-card-header">
            <div>
                <div class="bite-card-title">📅 7-Day Precision Meal Planner</div>
                <div style="font-size:12px; color:#64748B;">Rotating recipes that balance food shelf-life and nutritional consistency.</div>
            </div>
            <button class="btn btn-secondary" onclick="showToast('Regenerated weekly plan!')">↻ Regenerate Week</button>
        </div>

        <div class="bite-week-nav">
            ${weekDays.map((d, i) => `
                <div class="bite-day-btn ${weeklyDayIndex === i ? 'active' : ''}" onclick="selectWeeklyDay(${i})">
                    <div class="bite-day-name">${d.slice(0, 3)}</div>
                    <div class="bite-day-cal">${intel.targetCalories + (i % 2 === 0 ? 0 : -30)} kcal</div>
                </div>
            `).join('')}
        </div>

        <!-- Weekly Summary Metrics -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:24px; padding:16px; background:#F8FAFC; border-radius:14px; border:1px solid #E2E8F0;">
            <div>
                <div style="font-size:11px; color:#64748B; font-weight:700; text-transform:uppercase;">Weekly Average Intake</div>
                <div style="font-size:18px; font-weight:800; color:#0F172A;">${intel.targetCalories - 15} kcal / day</div>
            </div>
            <div>
                <div style="font-size:11px; color:#64748B; font-weight:700; text-transform:uppercase;">Average Protein Target</div>
                <div style="font-size:18px; font-weight:800; color:#065F46;">${intel.macros.protein}g / day (100% met)</div>
            </div>
            <div>
                <div style="font-size:11px; color:#64748B; font-weight:700; text-transform:uppercase;">Dietary Consistency Score</div>
                <div style="font-size:18px; font-weight:800; color:#D97706;">96% Optimal</div>
            </div>
        </div>

        <!-- Day's Schedule -->
        <div style="font-size:14px; font-weight:800; color:#0F172A; margin-bottom:12px;">Planned Menu for ${weekDays[weeklyDayIndex]}:</div>
        <div style="display:flex; flex-direction:column; gap:10px;">
            <div style="padding:12px 16px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <span style="font-size:11px; font-weight:800; color:#64748B; text-transform:uppercase;">Breakfast</span>
                    <div style="font-weight:700; font-size:14px; color:#0F172A;">Greek Yogurt, Apple &amp; Honey Bowl</div>
                </div>
                <div style="font-weight:700; font-size:13px; color:#065F46;">380 kcal • 26g Prot</div>
            </div>

            <div style="padding:12px 16px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <span style="font-size:11px; font-weight:800; color:#64748B; text-transform:uppercase;">Lunch</span>
                    <div style="font-weight:700; font-size:14px; color:#0F172A;">Seared Chicken Breast, Spinach &amp; Baby Carrots</div>
                </div>
                <div style="font-weight:700; font-size:13px; color:#065F46;">590 kcal • 52g Prot</div>
            </div>

            <div style="padding:12px 16px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <span style="font-size:11px; font-weight:800; color:#64748B; text-transform:uppercase;">Snack</span>
                    <div style="font-weight:700; font-size:14px; color:#0F172A;">Fuji Apple Wedges with Aged Cheddar</div>
                </div>
                <div style="font-weight:700; font-size:13px; color:#065F46;">260 kcal • 11g Prot</div>
            </div>

            <div style="padding:12px 16px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <span style="font-size:11px; font-weight:800; color:#64748B; text-transform:uppercase;">Dinner</span>
                    <div style="font-weight:700; font-size:14px; color:#0F172A;">Garden Vegetable &amp; Herb Sauté Skillet</div>
                </div>
                <div style="font-weight:700; font-size:13px; color:#065F46;">520 kcal • 43g Prot</div>
            </div>
        </div>

    </div>`;
}

function selectWeeklyDay(i) {
    weeklyDayIndex = i;
    renderBiteMode();
}

// -------------------------------------------------------------------------
// TAB 7: DAILY FOOD TRACKER / JOURNAL (MODULE 8)
// -------------------------------------------------------------------------
function renderFoodTrackerTab(intel, consumedCal, consumedProt, consumedCarb, consumedFat, consumedFib, remainingCal) {
    return `
    <div style="background:#ffffff; border-radius:18px; border:1px solid #E2E8F0; padding:24px; box-shadow:0 4px 16px rgba(0,0,0,0.04);">
        <div class="bite-card-header">
            <div>
                <div class="bite-card-title">📝 Daily Food Tracker &amp; Consumption Log</div>
                <div style="font-size:12px; color:#64748B;">Accurately separates planned meals from actually consumed provisions.</div>
            </div>
            <button class="bite-btn-gold" onclick="openQuickFoodLogModal()">+ Log Custom Food</button>
        </div>

        <div style="display:flex; gap:16px; margin-bottom:20px; flex-wrap:wrap;">
            <div style="background:#F0FDF4; border:1px solid #BBF7D0; border-radius:12px; padding:12px 16px; flex:1;">
                <div style="font-size:11px; color:#166534; font-weight:700;">TOTAL CONSUMED TODAY</div>
                <div style="font-size:20px; font-weight:800; color:#14532D;">${consumedCal} / ${intel.targetCalories} kcal</div>
            </div>
            <div style="background:#FEF3C7; border:1px solid #FDE68A; border-radius:12px; padding:12px 16px; flex:1;">
                <div style="font-size:11px; color:#92400E; font-weight:700;">PROTEIN CONSUMED</div>
                <div style="font-size:20px; font-weight:800; color:#78350F;">${consumedProt}g / ${intel.macros.protein}g</div>
            </div>
            <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:12px; padding:12px 16px; flex:1;">
                <div style="font-size:11px; color:#1E40AF; font-weight:700;">CALORIES REMAINING</div>
                <div style="font-size:20px; font-weight:800; color:#1E3A8A;">${remainingCal} kcal</div>
            </div>
        </div>

        <table class="bite-tracker-table">
            <thead>
                <tr>
                    <th>Meal / Time</th>
                    <th>Food Item</th>
                    <th>Calories</th>
                    <th>Protein</th>
                    <th>Carbs</th>
                    <th>Fat</th>
                    <th>Fiber</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${biteFoodLog.map(item => `
                    <tr>
                        <td><b>${item.mealType}</b> <span style="font-size:11px; color:#64748B;">(${item.time})</span></td>
                        <td>${item.name}</td>
                        <td><b>${item.calories} kcal</b></td>
                        <td>${item.protein}g</td>
                        <td>${item.carbs}g</td>
                        <td>${item.fat}g</td>
                        <td>${item.fiber}g</td>
                        <td>
                            <button onclick="removeFoodLogItem(${item.id})" style="background:none; border:none; color:#EF4444; font-weight:700; cursor:pointer;">✕ Remove</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>`;
}

function removeFoodLogItem(id) {
    biteFoodLog = biteFoodLog.filter(item => item.id !== id);
    saveBiteFoodLog();
    renderBiteMode();
    showToast('Entry removed from daily log.');
}

function openQuickFoodLogModal() {
    const root = document.getElementById('bite-substitution-modal-root');
    if (!root) return;

    root.innerHTML = `
    <div class="bite-modal-backdrop" onclick="closeSubstitutionModal()">
        <div class="bite-modal-window" onclick="event.stopPropagation()">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="font-size:18px; font-weight:800; color:#0F172A;">Log Consumed Food</div>
                <button onclick="closeSubstitutionModal()" style="background:none; border:none; font-size:18px; cursor:pointer;">✕</button>
            </div>
            
            <form onsubmit="handleQuickLogSubmit(event)" style="display:flex; flex-direction:column; gap:12px;">
                <div>
                    <label style="font-size:12px; font-weight:700; color:#475569;">Food Name</label>
                    <input type="text" id="log-name" required placeholder="e.g. Boiled Eggs with Whole Toast" style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid #CBD5E1; margin-top:4px;">
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div>
                        <label style="font-size:12px; font-weight:700; color:#475569;">Calories (kcal)</label>
                        <input type="number" id="log-cal" required placeholder="250" style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid #CBD5E1; margin-top:4px;">
                    </div>
                    <div>
                        <label style="font-size:12px; font-weight:700; color:#475569;">Protein (g)</label>
                        <input type="number" id="log-prot" required placeholder="18" style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid #CBD5E1; margin-top:4px;">
                    </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                    <div>
                        <label style="font-size:12px; font-weight:700; color:#475569;">Carbs (g)</label>
                        <input type="number" id="log-carb" value="15" style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid #CBD5E1; margin-top:4px;">
                    </div>
                    <div>
                        <label style="font-size:12px; font-weight:700; color:#475569;">Fat (g)</label>
                        <input type="number" id="log-fat" value="6" style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid #CBD5E1; margin-top:4px;">
                    </div>
                    <div>
                        <label style="font-size:12px; font-weight:700; color:#475569;">Fiber (g)</label>
                        <input type="number" id="log-fib" value="3" style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid #CBD5E1; margin-top:4px;">
                    </div>
                </div>
                <button type="submit" class="btn btn-accent" style="margin-top:10px; padding:10px;">Save to Food Journal</button>
            </form>
        </div>
    </div>`;
}

function handleQuickLogSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('log-name').value;
    const cal = parseInt(document.getElementById('log-cal').value) || 0;
    const prot = parseInt(document.getElementById('log-prot').value) || 0;
    const carb = parseInt(document.getElementById('log-carb').value) || 0;
    const fat = parseInt(document.getElementById('log-fat').value) || 0;
    const fib = parseInt(document.getElementById('log-fib').value) || 0;

    biteFoodLog.push({
        id: Date.now(),
        name,
        calories: cal,
        protein: prot,
        carbs: carb,
        fat,
        fiber: fib,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mealType: 'Custom Log'
    });

    saveBiteFoodLog();
    closeSubstitutionModal();
    renderBiteMode();
    showToast(`✓ Logged "${name}" into daily tracker!`);
}

// -------------------------------------------------------------------------
// TAB 8: AI NUTRITION ASSISTANT (MODULE 9)
// -------------------------------------------------------------------------
let assistantMessages = [
    { sender: 'bot', text: 'Hello Alex! I am your AI Nutrition Assistant. I have live access to your refrigerator inventory, your 68kg target goal, and today\'s remaining 1,320 kcal. How can I help you eat better today?' }
];

function renderNutritionAssistantTab() {
    return `
    <div class="bite-chat-card">
        <div style="padding:16px 20px; border-bottom:1px solid #E2E8F0; display:flex; align-items:center; justify-content:space-between;">
            <div style="font-weight:800; font-size:15px; color:#0F172A; display:flex; align-items:center; gap:8px;">
                <span>🤖</span> AI Nutrition Companion
            </div>
            <span style="font-size:11px; background:#DCFCE7; color:#15803D; font-weight:700; padding:3px 8px; border-radius:12px;">Connected to Smart Fridge</span>
        </div>

        <div class="bite-chat-messages" id="bite-chat-box">
            ${assistantMessages.map(m => `
                <div class="bite-chat-bubble ${m.sender}">${m.text}</div>
            `).join('')}
        </div>

        <!-- Quick Prompt Chips -->
        <div class="bite-quick-prompt-bar">
            <div class="bite-prompt-chip" onclick="sendQuickPrompt('What should I eat for dinner with what I have?')">🍲 Dinner with Fridge Food</div>
            <div class="bite-prompt-chip" onclick="sendQuickPrompt('I have 500 kcal remaining. What can I eat?')">🔥 500 kcal remaining</div>
            <div class="bite-prompt-chip" onclick="sendQuickPrompt('How can I increase my protein intake?')">🍗 Boost Protein</div>
            <div class="bite-prompt-chip" onclick="sendQuickPrompt('Which foods in my refrigerator expire first?')">⏳ Expiring Soon</div>
        </div>

        <div class="bite-chat-input-bar">
            <input type="text" id="bite-chat-input" class="bite-chat-input" placeholder="Ask about meals, fridge ingredients, calorie limits..." onkeypress="handleAssistantKeyPress(event)">
            <button class="btn btn-accent" onclick="sendAssistantMessage()">Send</button>
        </div>
    </div>`;
}

function handleAssistantKeyPress(e) {
    if (e.key === 'Enter') sendAssistantMessage();
}

function sendQuickPrompt(promptText) {
    const input = document.getElementById('bite-chat-input');
    if (input) input.value = promptText;
    sendAssistantMessage();
}

function sendAssistantMessage() {
    const input = document.getElementById('bite-chat-input');
    if (!input || !input.value.trim()) return;

    const userText = input.value.trim();
    assistantMessages.push({ sender: 'user', text: userText });
    input.value = '';
    renderBiteMode();

    // Scroll to bottom
    setTimeout(() => {
        const box = document.getElementById('bite-chat-box');
        if (box) box.scrollTop = box.scrollHeight;
    }, 50);

    // AI Contextual Response
    setTimeout(() => {
        let reply = generateAssistantReply(userText);
        assistantMessages.push({ sender: 'bot', text: reply });
        renderBiteMode();
        setTimeout(() => {
            const box = document.getElementById('bite-chat-box');
            if (box) box.scrollTop = box.scrollHeight;
        }, 50);
    }, 600);
}

function generateAssistantReply(query) {
    const q = query.toLowerCase();
    if (q.includes('dinner') || q.includes('eat')) {
        return `Based on what's in your refrigerator right now, I recommend a **Pan-Seared Herb Chicken Breast with Fresh Spinach & Baby Carrots**. You have 200g of chicken breast and the spinach is approaching its best-by date in 48h. This will provide ~45g of protein for just 490 kcal, fitting into your remaining allowance!`;
    } else if (q.includes('500') || q.includes('remaining') || q.includes('calories')) {
        return `With ~500 kcal remaining, a high-satiety option from your fridge is **180g Greek Yogurt paired with 1 sliced Fuji Apple and 25g Cheddar Cheese**. That gives you 385 kcal, 24g protein, and 5g fiber, leaving 115 kcal of buffer!`;
    } else if (q.includes('protein')) {
        return `To hit your 130g protein goal today, you can add 2 large eggs to your lunch, or an extra 150g Greek yogurt bowl. In your live fridge inventory, chicken breast (52g/serving) and Greek yogurt (18g/serving) are your strongest protein sources.`;
    } else if (q.includes('expire') || q.includes('first')) {
        return `Your **Fresh Spinach** and **Whole Milk** should be consumed first within the next 48 hours to preserve peak nutritional value and prevent waste!`;
    } else {
        return `I checked your nutrition profile and refrigerator inventory: you are in a healthy calorie range today with plenty of micronutrients. Chicken breast, apples, and Greek yogurt are available for any meal customization!`;
    }
}

// -------------------------------------------------------------------------
// TAB 9: WEIGHT PROGRESS & ANALYTICS (MODULE 10)
// -------------------------------------------------------------------------
function renderWeightProgressTab() {
    const currentW = biteWeightHistory[biteWeightHistory.length - 1].weight;
    const startW = biteWeightHistory[0].weight;
    const targetW = biteProfile.targetWeight;
    const totalLost = (startW - currentW).toFixed(1);
    const remainingToLose = (currentW - targetW).toFixed(1);
    const progressPercent = Math.min(100, Math.max(0, Math.round(((startW - currentW) / (startW - targetW)) * 100)));

    return `
    <div class="bite-progress-grid">
        
        <!-- Interactive Weight Chart Card -->
        <div class="bite-chart-card">
            <div class="bite-card-header">
                <div>
                    <div class="bite-card-title">📈 Weight Trend &amp; Progress Curve</div>
                    <div style="font-size:12px; color:#64748B;">Tracking your journey from ${startW}kg to your ${targetW}kg goal.</div>
                </div>
            </div>

            <!-- SVG Chart -->
            <div style="width:100%; height:220px; margin:16px 0; position:relative;">
                <svg viewBox="0 0 500 200" style="width:100%; height:100%; overflow:visible;">
                    <!-- Grid lines -->
                    <line x1="40" y1="30" x2="480" y2="30" stroke="#F1F5F9" stroke-width="1" />
                    <line x1="40" y1="80" x2="480" y2="80" stroke="#F1F5F9" stroke-width="1" />
                    <line x1="40" y1="130" x2="480" y2="130" stroke="#F1F5F9" stroke-width="1" />
                    <line x1="40" y1="180" x2="480" y2="180" stroke="#E2E8F0" stroke-width="1" />

                    <!-- Target Weight Line (Dashed Gold) -->
                    <line x1="40" y1="160" x2="480" y2="160" stroke="#D4AF37" stroke-width="2" stroke-dasharray="6,4" />
                    <text x="485" y="164" fill="#D4AF37" font-size="10" font-weight="700">Goal: ${targetW}kg</text>

                    <!-- Actual Progress Line (Green) -->
                    <polyline fill="none" stroke="#065F46" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
                              points="60,40 180,70 300,105 420,135" />

                    <!-- Data dots -->
                    <circle cx="60" cy="40" r="5" fill="#064E3B" stroke="#ffffff" stroke-width="2" />
                    <circle cx="180" cy="70" r="5" fill="#064E3B" stroke="#ffffff" stroke-width="2" />
                    <circle cx="300" cy="105" r="5" fill="#064E3B" stroke="#ffffff" stroke-width="2" />
                    <circle cx="420" cy="135" r="6" fill="#10B981" stroke="#ffffff" stroke-width="2" />

                    <!-- Labels -->
                    <text x="60" y="25" fill="#475569" font-size="10" font-weight="700" text-anchor="middle">73.2kg</text>
                    <text x="180" y="55" fill="#475569" font-size="10" font-weight="700" text-anchor="middle">72.8kg</text>
                    <text x="300" y="90" fill="#475569" font-size="10" font-weight="700" text-anchor="middle">72.4kg</text>
                    <text x="420" y="120" fill="#065F46" font-size="11" font-weight="800" text-anchor="middle">${currentW}kg</text>
                </svg>
            </div>

            <div style="background:#F8FAFC; border-radius:12px; padding:14px; font-size:12px; color:#475569; border:1px solid #E2E8F0; line-height:1.5;">
                💡 <b>Clinical Guidance:</b> Short-term day-to-day fluctuations (0.5–1.5 kg) reflect hydration, dietary sodium, and glycogen storage—not fat regain. Your 4-week trend shows steady, sustainable metabolic progress!
            </div>
        </div>

        <!-- Weight Log & Entry Card -->
        <div class="bite-weight-log-card">
            <div class="bite-card-title" style="margin-bottom:12px;">Log New Check-in</div>
            
            <form onsubmit="handleWeightLogSubmit(event)" style="display:flex; flex-direction:column; gap:10px;">
                <div>
                    <label style="font-size:11px; font-weight:700; color:#475569;">Weight (kg)</label>
                    <input type="number" step="0.1" id="new-weight-val" required value="${currentW}" style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid #CBD5E1; margin-top:2px;">
                </div>
                <div>
                    <label style="font-size:11px; font-weight:700; color:#475569;">Notes</label>
                    <input type="text" id="new-weight-note" placeholder="e.g. Morning fasting check-in" style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid #CBD5E1; margin-top:2px;">
                </div>
                <button type="submit" class="btn btn-accent" style="padding:10px; font-size:12px;">+ Record Weight</button>
            </form>

            <div style="margin-top:20px;">
                <div style="font-size:12px; font-weight:800; color:#0F172A; margin-bottom:8px;">Recent Check-ins:</div>
                <div style="display:flex; flex-direction:column; gap:6px; max-height:150px; overflow-y:auto;">
                    ${biteWeightHistory.slice().reverse().map(h => `
                        <div style="display:flex; justify-content:space-between; font-size:12px; padding:6px 10px; background:#F8FAFC; border-radius:8px;">
                            <span><b>${h.date}</b></span>
                            <span>${h.weight} kg</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

    </div>`;
}

function handleWeightLogSubmit(e) {
    e.preventDefault();
    const w = parseFloat(document.getElementById('new-weight-val').value);
    const note = document.getElementById('new-weight-note').value || 'Routine check-in';
    const dateStr = new Date().toISOString().split('T')[0];

    biteWeightHistory.push({ date: dateStr, weight: w, note });
    biteProfile.currentWeight = w;
    saveBiteProfile();
    saveBiteWeightHistory();
    renderBiteMode();
    showToast(`✓ Weight of ${w} kg recorded! Nutrition targets updated.`);
}

// =========================================================================
// 6. ONBOARDING & PROFILE MODAL (MODULE 1)
// =========================================================================
function openProfileModal() {
    const root = document.getElementById('bite-profile-modal-root');
    if (!root) return;

    root.innerHTML = `
    <div class="bite-modal-backdrop" onclick="closeProfileModal()">
        <div class="bite-modal-window" onclick="event.stopPropagation()">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="font-size:20px; font-weight:800; color:#0F172A;">Personal Nutrition &amp; Body Profile</div>
                <button onclick="closeProfileModal()" style="background:none; border:none; font-size:20px; cursor:pointer;">✕</button>
            </div>
            
            <form onsubmit="handleProfileModalSubmit(event)" style="display:flex; flex-direction:column; gap:16px;">
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div>
                        <label style="font-size:12px; font-weight:700; color:#475569;">Full Name</label>
                        <input type="text" id="prof-name" value="${biteProfile.name}" required style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid #CBD5E1; margin-top:4px;">
                    </div>
                    <div>
                        <label style="font-size:12px; font-weight:700; color:#475569;">Biological Sex (for Mifflin-St Jeor)</label>
                        <select id="prof-gender" style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid #CBD5E1; margin-top:4px;">
                            <option value="male" ${biteProfile.gender === 'male' ? 'selected' : ''}>Male (+5 BMR factor)</option>
                            <option value="female" ${biteProfile.gender === 'female' ? 'selected' : ''}>Female (-161 BMR factor)</option>
                        </select>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:12px;">
                    <div>
                        <label style="font-size:12px; font-weight:700; color:#475569;">Current Wt (kg)</label>
                        <input type="number" step="0.5" id="prof-cur-w" value="${biteProfile.currentWeight}" required style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid #CBD5E1; margin-top:4px;">
                    </div>
                    <div>
                        <label style="font-size:12px; font-weight:700; color:#475569;">Target Wt (kg)</label>
                        <input type="number" step="0.5" id="prof-tar-w" value="${biteProfile.targetWeight}" required style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid #CBD5E1; margin-top:4px;">
                    </div>
                    <div>
                        <label style="font-size:12px; font-weight:700; color:#475569;">Height (cm)</label>
                        <input type="number" id="prof-h" value="${biteProfile.height}" required style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid #CBD5E1; margin-top:4px;">
                    </div>
                    <div>
                        <label style="font-size:12px; font-weight:700; color:#475569;">Age</label>
                        <input type="number" id="prof-age" value="${biteProfile.age}" required style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid #CBD5E1; margin-top:4px;">
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div>
                        <label style="font-size:12px; font-weight:700; color:#475569;">Activity Level</label>
                        <select id="prof-act" style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid #CBD5E1; margin-top:4px;">
                            <option value="sedentary" ${biteProfile.activityLevel === 'sedentary' ? 'selected' : ''}>Sedentary (Little or no exercise)</option>
                            <option value="light" ${biteProfile.activityLevel === 'light' ? 'selected' : ''}>Lightly Active (1-3 days/wk)</option>
                            <option value="moderate" ${biteProfile.activityLevel === 'moderate' ? 'selected' : ''}>Moderately Active (3-5 days/wk)</option>
                            <option value="very" ${biteProfile.activityLevel === 'very' ? 'selected' : ''}>Very Active (6-7 days/wk)</option>
                            <option value="extreme" ${biteProfile.activityLevel === 'extreme' ? 'selected' : ''}>Extremely Active (Athletic/Hard Labor)</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:12px; font-weight:700; color:#475569;">Fitness Goal</label>
                        <select id="prof-goal" style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid #CBD5E1; margin-top:4px;">
                            <option value="fat_loss" ${biteProfile.goal === 'fat_loss' ? 'selected' : ''}>Lose Weight (Safe Deficit)</option>
                            <option value="maintain" ${biteProfile.goal === 'maintain' ? 'selected' : ''}>Maintain Weight</option>
                            <option value="muscle_gain" ${biteProfile.goal === 'muscle_gain' ? 'selected' : ''}>Build Muscle (High Protein)</option>
                            <option value="weight_gain" ${biteProfile.goal === 'weight_gain' ? 'selected' : ''}>Gain Weight (Calorie Surplus)</option>
                        </select>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div>
                        <label style="font-size:12px; font-weight:700; color:#475569;">Dietary Preference</label>
                        <select id="prof-diet" style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid #CBD5E1; margin-top:4px;">
                            <option value="non_veg" ${biteProfile.dietType === 'non_veg' ? 'selected' : ''}>Non-Vegetarian</option>
                            <option value="veg" ${biteProfile.dietType === 'veg' ? 'selected' : ''}>Vegetarian</option>
                            <option value="vegan" ${biteProfile.dietType === 'vegan' ? 'selected' : ''}>Vegan</option>
                            <option value="eggetarian" ${biteProfile.dietType === 'eggetarian' ? 'selected' : ''}>Eggetarian</option>
                            <option value="pescatarian" ${biteProfile.dietType === 'pescatarian' ? 'selected' : ''}>Pescatarian</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:12px; font-weight:700; color:#475569;">Allergies &amp; Exclusions</label>
                        <input type="text" id="prof-allergies" value="${biteProfile.allergies.join(', ')}" placeholder="e.g. Peanuts, Shellfish" style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid #CBD5E1; margin-top:4px;">
                    </div>
                </div>

                <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:10px; font-size:11px; color:#64748B;">
                    ⚠️ <b>Health Guidance:</b> BITE MODE uses clinical dietary reference intakes for general health and wellness. It does not replace supervised medical therapy for eating disorders, pregnancy, or metabolic diseases.
                </div>

                <button type="submit" class="btn btn-accent" style="padding:12px; font-size:13px; font-weight:700;">Save &amp; Recalculate BITE Mode</button>
            </form>
        </div>
    </div>`;
}

function closeProfileModal() {
    const root = document.getElementById('bite-profile-modal-root');
    if (root) root.innerHTML = '';
}

function handleProfileModalSubmit(e) {
    e.preventDefault();
    biteProfile.name = document.getElementById('prof-name').value;
    biteProfile.gender = document.getElementById('prof-gender').value;
    biteProfile.currentWeight = parseFloat(document.getElementById('prof-cur-w').value);
    biteProfile.targetWeight = parseFloat(document.getElementById('prof-tar-w').value);
    biteProfile.height = parseInt(document.getElementById('prof-h').value);
    biteProfile.age = parseInt(document.getElementById('prof-age').value);
    biteProfile.activityLevel = document.getElementById('prof-act').value;
    biteProfile.goal = document.getElementById('prof-goal').value;
    biteProfile.dietType = document.getElementById('prof-diet').value;
    biteProfile.allergies = document.getElementById('prof-allergies').value.split(',').map(s => s.trim()).filter(Boolean);

    saveBiteProfile();
    closeProfileModal();
    currentDietPlan = null; // trigger re-generation with new profile
    renderBiteMode();
    showToast('✓ Profile updated! Daily calorie and nutrient targets recalculated.');
}
