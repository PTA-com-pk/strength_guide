// Shared calculator functions

export interface CalculatorResult {
  value: number
  unit: string
  breakdown?: Array<{ label: string; value: number | string }>
  recommendations?: string[]
}

// BMR Calculator
export function calculateBMR(gender: string, age: number, weight: number, height: number, unit: string): CalculatorResult {
  const weightKg = unit === 'imperial' ? weight * 0.453592 : weight
  const heightCm = unit === 'imperial' ? height * 2.54 : height

  let bmr: number
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161
  }

  return {
    value: Math.round(bmr),
    unit: 'calories/day',
    breakdown: [
      { label: 'Age', value: age },
      { label: 'Weight', value: `${weightKg.toFixed(1)} kg` },
      { label: 'Height', value: `${heightCm.toFixed(1)} cm` },
    ],
    recommendations: [
      `Your BMR is ${Math.round(bmr)} calories per day - this is what your body burns at complete rest`,
      'To maintain weight, multiply BMR by your activity level to get TDEE',
      'For weight loss: Create a 500-1000 calorie deficit from your TDEE (aim for 0.5-1 lb loss per week)',
      'For muscle gain: Eat 300-500 calories above your TDEE and follow a strength training program',
      'Track your progress: Recalculate your BMR every 10-15 lbs of weight change',
      'Your BMR accounts for 60-75% of total daily calorie burn',
      '💡 Next step: Use our TDEE Calculator to find your total daily calorie needs',
      '💡 Related tools: Protein Calculator, Macros Calculator, Calorie Deficit Calculator',
    ],
  }
}

// TDEE Calculator
export function calculateTDEE(bmr: number, activityLevel: string): CalculatorResult {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    extra: 1.9,
  }

  const tdee = Math.round(bmr * (multipliers[activityLevel] || 1.2))

  const activityNames: Record<string, string> = {
    sedentary: 'Sedentary (little/no exercise)',
    light: 'Light Activity (1-3 days/week)',
    moderate: 'Moderate Activity (3-5 days/week)',
    active: 'Active (6-7 days/week)',
    extra: 'Extra Active (very hard exercise, physical job)',
  }

  return {
    value: tdee,
    unit: 'calories/day',
    breakdown: [
      { label: 'BMR', value: `${bmr} calories/day` },
      { label: 'Activity Level', value: activityNames[activityLevel] || activityLevel },
      { label: 'Activity Multiplier', value: multipliers[activityLevel] || 1.2 },
      { label: 'TDEE', value: `${tdee} calories/day` },
    ],
    recommendations: [
      `Your TDEE is ${tdee} calories per day - eat this amount to maintain your current weight`,
      'For weight loss: Subtract 500 calories to lose ~1 lb/week or 250 calories for ~0.5 lb/week',
      'For muscle gain: Add 300-500 calories and ensure adequate protein intake (1.6-2.2g per kg body weight)',
      'Track your food intake: Use a food tracking app to monitor your daily calories',
      'Be patient: Sustainable weight changes take time - aim for 0.5-1 lb per week',
      'Reassess monthly: Your TDEE changes as your weight and activity level change',
      '💡 Next step: Use our Calorie Deficit Calculator to plan your weight loss',
      '💡 Related tools: Protein Calculator, Macros Calculator, BMR Calculator',
    ],
  }
}

// Protein Calculator
export function calculateProtein(weight: number, activityLevel: string, goal: string, unit: string): CalculatorResult {
  const weightKg = unit === 'imperial' ? weight * 0.453592 : weight

  let proteinPerKg = 1.6
  if (activityLevel === 'sedentary') proteinPerKg = 1.2
  else if (activityLevel === 'light') proteinPerKg = 1.4
  else if (activityLevel === 'moderate') proteinPerKg = 1.6
  else if (activityLevel === 'active') proteinPerKg = 1.8
  else if (activityLevel === 'very-active') proteinPerKg = 2.0

  if (goal === 'muscle-gain') proteinPerKg += 0.2
  if (goal === 'fat-loss') proteinPerKg += 0.2

  const proteinGrams = Math.round(weightKg * proteinPerKg)

  return {
    value: proteinGrams,
    unit: 'grams/day',
    breakdown: [
      { label: 'Body Weight', value: `${weightKg.toFixed(1)} kg` },
      { label: 'Protein per kg', value: `${proteinPerKg.toFixed(1)}g` },
      { label: 'Activity Level', value: activityLevel },
      { label: 'Goal', value: goal },
    ],
    recommendations: [
      `Aim for ${proteinGrams}g of protein per day`,
      'Spread protein intake throughout the day',
      'Include protein in every meal',
      'Good sources: chicken, fish, eggs, dairy, legumes',
      '💡 Next step: Use our Macros Calculator to balance protein, carbs, and fats',
      '💡 Related tools: TDEE Calculator, BMR Calculator, Calorie Deficit Calculator',
    ],
  }
}

// BMI Calculator
export function calculateBMI(weight: number, height: number, unit: string): CalculatorResult {
  let bmi: number

  if (unit === 'imperial') {
    bmi = (weight / (height * height)) * 703
  } else {
    const heightM = height / 100
    bmi = weight / (heightM * heightM)
  }

  let category = ''
  if (bmi < 18.5) category = 'Underweight'
  else if (bmi < 25) category = 'Normal weight'
  else if (bmi < 30) category = 'Overweight'
  else category = 'Obese'

  let bmiRecommendations: string[] = []
  
  if (category === 'Underweight') {
    bmiRecommendations = [
      `Your BMI is ${bmi.toFixed(1)} - you're in the underweight category`,
      'Focus on gradual weight gain: Aim for 0.5-1 lb per week through healthy eating',
      'Increase calories: Add 300-500 calories daily from nutrient-dense foods',
      'Strength training: Build muscle mass through resistance training 2-3x per week',
      'Monitor health: Consult a healthcare provider to rule out underlying conditions',
    ]
  } else if (category === 'Normal weight') {
    bmiRecommendations = [
      `Your BMI is ${bmi.toFixed(1)} - you're in the healthy weight range`,
      'Maintain your current lifestyle: Continue balanced nutrition and regular exercise',
      'Focus on body composition: Consider building muscle while maintaining weight',
      'Regular check-ups: Maintain this range through consistent healthy habits',
    ]
  } else if (category === 'Overweight') {
    bmiRecommendations = [
      `Your BMI is ${bmi.toFixed(1)} - you're in the overweight category`,
      'Gradual weight loss: Aim for 1-2 lbs per week through diet and exercise',
      'Create a calorie deficit: Reduce daily intake by 500-1000 calories',
      'Incorporate exercise: Aim for 150+ minutes of moderate activity per week',
      'Focus on whole foods: Prioritize vegetables, lean proteins, and whole grains',
    ]
  } else {
    bmiRecommendations = [
      `Your BMI is ${bmi.toFixed(1)} - you're in the obese category`,
      'Consult a healthcare provider: Create a safe, supervised weight loss plan',
      'Sustainable approach: Aim for 1-2 lbs per week weight loss',
      'Lifestyle changes: Focus on long-term dietary and exercise modifications',
      'Support system: Consider working with a dietitian or weight loss specialist',
    ]
  }

  return {
    value: parseFloat(bmi.toFixed(1)),
    unit: 'BMI',
    breakdown: [
      { label: 'BMI', value: bmi.toFixed(1) },
      { label: 'Category', value: category },
      { label: 'Weight', value: unit === 'imperial' ? `${weight} lbs` : `${(weight * 0.453592).toFixed(1)} kg` },
      { label: 'Height', value: unit === 'imperial' ? `${height} inches` : `${(height / 2.54).toFixed(1)} cm` },
    ],
    recommendations: [
      ...bmiRecommendations,
      '💡 Next step: Use our Body Fat Calculator for a more accurate body composition assessment',
      '💡 Related tools: Ideal Weight Calculator, Lean Body Mass Calculator, TDEE Calculator',
    ],
  }
}

// One Rep Max Calculator
export function calculate1RM(weight: number, reps: number): CalculatorResult {
  const oneRM = Math.round(weight * (1 + reps / 30))

  const percentageReps: Array<{ percentage: number; reps: number }> = [
    { percentage: 100, reps: 1 },
    { percentage: 95, reps: 2 },
    { percentage: 90, reps: 3 },
    { percentage: 85, reps: 5 },
    { percentage: 80, reps: 6 },
    { percentage: 75, reps: 8 },
    { percentage: 70, reps: 10 },
  ]

  return {
    value: oneRM,
    unit: 'lbs',
    breakdown: [
      { label: 'Weight Used', value: `${weight} lbs` },
      { label: 'Reps Completed', value: reps },
      { label: 'Estimated 1RM', value: `${oneRM} lbs` },
      ...percentageReps.slice(0, 3).map(p => ({
        label: `${p.percentage}% of 1RM`,
        value: `${Math.round(oneRM * p.percentage / 100)} lbs (${p.reps} reps)`,
      })),
    ],
    recommendations: [
      `Your estimated one-rep max is ${oneRM} lbs`,
      'Always use a spotter when testing 1RM or lifting heavy weights',
      'Warm up properly: Do 3-4 warm-up sets before attempting max weight',
      'Training percentages: Use 70-85% of 1RM for strength training (3-8 reps)',
      'Volume work: Use 60-70% of 1RM for hypertrophy (8-12 reps)',
      'Re-test regularly: Your 1RM increases as you get stronger - retest every 4-6 weeks',
      '💡 Next step: Use our Training Volume Calculator to track your total workout volume',
      '💡 Related tools: Training Volume Calculator, Protein Calculator (for muscle recovery)',
    ],
  }
}

// Macros Calculator
export function calculateMacros(tdee: number, goal: string, protein: number): CalculatorResult {
  let proteinCalories: number
  let carbCalories: number
  let fatCalories: number

  if (goal === 'muscle-gain') {
    proteinCalories = protein * 4
    fatCalories = tdee * 0.25
    carbCalories = tdee - proteinCalories - fatCalories
  } else if (goal === 'fat-loss') {
    proteinCalories = protein * 4
    fatCalories = tdee * 0.20
    carbCalories = tdee - proteinCalories - fatCalories
  } else {
    proteinCalories = protein * 4
    fatCalories = tdee * 0.30
    carbCalories = tdee - proteinCalories - fatCalories
  }

  const proteinGrams = Math.round(proteinCalories / 4)
  const carbGrams = Math.round(carbCalories / 4)
  const fatGrams = Math.round(fatCalories / 9)

  const goalAdvice: Record<string, string[]> = {
    'muscle-gain': [
      'Increase calories gradually: Add 300-500 calories above maintenance',
      'Prioritize protein: Maintain high protein intake for muscle synthesis',
      'Post-workout carbs: Consume 40-60g carbs after training to replenish glycogen',
      'Monitor weight: Aim for 0.5-1 lb gain per week',
    ],
    'fat-loss': [
      'Create sustainable deficit: Aim for 1-2 lbs weight loss per week',
      'Maintain protein: High protein preserves muscle mass during fat loss',
      'Control carbs: Reduce refined carbs, focus on vegetables and whole grains',
      'Track progress: Monitor measurements and photos, not just scale weight',
    ],
    'maintenance': [
      'Balance is key: Maintain these ratios while eating at maintenance calories',
      'Adjust as needed: Tweak macros based on energy levels and performance',
      'Prioritize whole foods: Focus on nutrient-dense sources for each macro',
      'Stay consistent: Consistency is more important than perfection',
    ],
  }

  return {
    value: 0,
    unit: 'macros',
    breakdown: [
      { label: 'Protein', value: `${proteinGrams}g (${Math.round((proteinCalories / tdee) * 100)}%)` },
      { label: 'Carbs', value: `${carbGrams}g (${Math.round((carbCalories / tdee) * 100)}%)` },
      { label: 'Fats', value: `${fatGrams}g (${Math.round((fatCalories / tdee) * 100)}%)` },
      { label: 'Total Calories', value: `${Math.round(tdee)} kcal` },
    ],
    recommendations: [
      `Your daily macro targets: ${proteinGrams}g protein, ${carbGrams}g carbs, ${fatGrams}g fats`,
      ...(goalAdvice[goal] || []),
      'Meal timing: Distribute macros evenly across 4-6 meals throughout the day',
      'Track consistently: Use a food tracking app to monitor your macro intake',
      'Be flexible: These are targets, not strict rules - adjust based on your response',
      '💡 Next step: Use our Protein Calculator to verify your protein intake is optimal',
      '💡 Related tools: TDEE Calculator, Calorie Deficit Calculator, BMR Calculator',
    ],
  }
}

// Ideal Weight Calculator
export function calculateIdealWeight(gender: string, height: number, unit: string): CalculatorResult {
  const heightCm = unit === 'imperial' ? height * 2.54 : height

  let idealWeightKg: number
  if (gender === 'male') {
    idealWeightKg = 52 + 1.9 * (heightCm - 152.4) / 2.54
  } else {
    idealWeightKg = 49 + 1.7 * (heightCm - 152.4) / 2.54
  }

  const idealWeightLbs = idealWeightKg * 2.20462

  return {
    value: unit === 'imperial' ? Math.round(idealWeightLbs) : Math.round(idealWeightKg),
    unit: unit === 'imperial' ? 'lbs' : 'kg',
    breakdown: [
      { label: 'Height', value: `${heightCm.toFixed(1)} cm` },
      { label: 'Gender', value: gender === 'male' ? 'Male' : 'Female' },
      { label: 'Ideal Weight Range', value: unit === 'imperial' 
        ? `${Math.round(idealWeightLbs - 5)} - ${Math.round(idealWeightLbs + 5)} lbs`
        : `${Math.round(idealWeightKg - 2)} - ${Math.round(idealWeightKg + 2)} kg` },
      { label: 'Ideal Weight (Mid)', value: unit === 'imperial' ? `${Math.round(idealWeightLbs)} lbs` : `${Math.round(idealWeightKg)} kg` },
    ],
    recommendations: [
      `Your ideal weight range is ${unit === 'imperial' ? `${Math.round(idealWeightLbs - 5)}-${Math.round(idealWeightLbs + 5)} lbs` : `${Math.round(idealWeightKg - 2)}-${Math.round(idealWeightKg + 2)} kg`}`,
      'This is an estimate: Actual ideal weight varies based on muscle mass and body composition',
      'Muscle weighs more than fat: Athletes may weigh more than this range but still be healthy',
      'Focus on body composition: Instead of just weight, consider body fat percentage and muscle mass',
      'Sustainable approach: Work towards your ideal weight gradually (0.5-1 lb per week)',
      'Consult professionals: Talk to a healthcare provider or dietitian for personalized guidance',
      '💡 Next step: Use our Body Fat Calculator to assess your body composition',
      '💡 Related tools: BMI Calculator, Lean Body Mass Calculator, TDEE Calculator',
    ],
  }
}

// Calorie Deficit Calculator
export function calculateCalorieDeficit(tdee: number, goal: string): CalculatorResult {
  let deficit: number
  let targetCalories: number
  let weeklyLoss: number

  if (goal === 'moderate') {
    deficit = 500
    weeklyLoss = 0.5
  } else if (goal === 'aggressive') {
    deficit = 1000
    weeklyLoss = 1.0
  } else {
    deficit = 250
    weeklyLoss = 0.25
  }

  targetCalories = Math.max(1200, tdee - deficit)

  const deficitType = goal === 'aggressive' ? 'Aggressive' : goal === 'moderate' ? 'Moderate' : 'Slow'

  return {
    value: targetCalories,
    unit: 'calories/day',
    breakdown: [
      { label: 'TDEE', value: `${tdee} calories/day` },
      { label: 'Deficit', value: `${deficit} calories/day` },
      { label: 'Target Calories', value: `${targetCalories} calories/day` },
      { label: 'Expected Loss', value: `${weeklyLoss} lbs/week` },
      { label: 'Monthly Loss', value: `~${(weeklyLoss * 4).toFixed(1)} lbs/month` },
    ],
    recommendations: [
      `Your target: ${targetCalories} calories per day for ${deficitType.toLowerCase()} weight loss (${weeklyLoss} lbs/week)`,
      `Weekly goal: Aim to lose ${weeklyLoss} lbs per week - sustainable and healthy`,
      'Minimum calories: Never go below 1200 calories/day (women) or 1500 calories/day (men)',
      'Combine strategies: Add 200-300 calories burned through exercise for faster results',
      'Track everything: Use a food scale and tracking app for accurate calorie counting',
      'Reassess monthly: Adjust your deficit as you lose weight - your TDEE decreases',
      'Be patient: Sustainable weight loss takes time - focus on consistency over speed',
      '💡 Next step: Use our Macros Calculator to balance your nutrients while cutting calories',
      '💡 Related tools: Protein Calculator, TDEE Calculator, Body Fat Calculator',
    ],
  }
}

// Body Fat Calculator
export function calculateBodyFat(gender: string, age: number, weight: number, height: number, neck: number, waist: number, unit: string, hip?: number): CalculatorResult {
  const weightKg = unit === 'imperial' ? weight * 0.453592 : weight
  const heightCm = unit === 'imperial' ? height * 2.54 : height
  const neckCm = unit === 'imperial' ? neck * 2.54 : neck
  const waistCm = unit === 'imperial' ? waist * 2.54 : waist
  const hipCm = hip ? (unit === 'imperial' ? hip * 2.54 : hip) : undefined

  let bodyFat: number

  if (gender === 'male') {
    bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450
  } else {
    if (!hipCm) {
      throw new Error('Hip measurement required for women')
    }
    bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450
  }

  bodyFat = Math.max(0, Math.min(100, bodyFat))

  let category = ''
  if (gender === 'male') {
    if (bodyFat < 6) category = 'Essential Fat'
    else if (bodyFat < 14) category = 'Athletes'
    else if (bodyFat < 18) category = 'Fitness'
    else if (bodyFat < 25) category = 'Average'
    else category = 'Obese'
  } else {
    if (bodyFat < 16) category = 'Essential Fat'
    else if (bodyFat < 20) category = 'Athletes'
    else if (bodyFat < 25) category = 'Fitness'
    else if (bodyFat < 32) category = 'Average'
    else category = 'Obese'
  }

  const leanMassKg = weightKg * (1 - bodyFat / 100)
  const fatMassKg = weightKg - leanMassKg

  let categoryAdvice: string[] = []
  if (gender === 'male') {
    if (bodyFat < 6) {
      categoryAdvice = ['Essential fat level - may affect hormone production', 'Consider maintaining or slightly increasing body fat']
    } else if (bodyFat < 14) {
      categoryAdvice = ['Athlete level - excellent for performance', 'Maintain through consistent training and nutrition']
    } else if (bodyFat < 18) {
      categoryAdvice = ['Fitness level - good balance of leanness and health', 'Focus on maintaining while building muscle']
    } else if (bodyFat < 25) {
      categoryAdvice = ['Average level - room for improvement', 'Aim for 15-18% through diet and exercise']
    } else {
      categoryAdvice = ['Above average - consider weight loss', 'Focus on reducing body fat through calorie deficit and resistance training']
    }
  } else {
    if (bodyFat < 16) {
      categoryAdvice = ['Essential fat level - too low may affect health', 'Consider increasing body fat slightly']
    } else if (bodyFat < 20) {
      categoryAdvice = ['Athlete level - excellent for performance', 'Maintain through consistent training and nutrition']
    } else if (bodyFat < 25) {
      categoryAdvice = ['Fitness level - good balance of leanness and health', 'Focus on maintaining while building muscle']
    } else if (bodyFat < 32) {
      categoryAdvice = ['Average level - room for improvement', 'Aim for 20-25% through diet and exercise']
    } else {
      categoryAdvice = ['Above average - consider weight loss', 'Focus on reducing body fat through calorie deficit and resistance training']
    }
  }

  return {
    value: parseFloat(bodyFat.toFixed(1)),
    unit: '%',
    breakdown: [
      { label: 'Body Fat %', value: `${bodyFat.toFixed(1)}%` },
      { label: 'Category', value: category },
      { label: 'Total Weight', value: `${weightKg.toFixed(1)} kg` },
      { label: 'Fat Mass', value: `${fatMassKg.toFixed(1)} kg` },
      { label: 'Lean Body Mass', value: `${leanMassKg.toFixed(1)} kg` },
    ],
    recommendations: [
      `Your body fat percentage is ${bodyFat.toFixed(1)}% (${category})`,
      ...categoryAdvice,
      'Track monthly: Re-measure every 4-6 weeks to monitor progress',
      'Combine methods: Use this with other measurements like progress photos and strength gains',
      'Focus on body composition: Work on building muscle while reducing fat',
      '💡 Next step: Use our Lean Body Mass Calculator to track your muscle mass',
      '💡 Related tools: BMI Calculator, Ideal Weight Calculator, Protein Calculator',
    ],
  }
}

// Lean Body Mass Calculator
export function calculateLeanBodyMass(weight: number, bodyFat: number, unit: string): CalculatorResult {
  const weightKg = unit === 'imperial' ? weight * 0.453592 : weight
  const leanMassKg = weightKg * (1 - bodyFat / 100)
  const leanMassLbs = leanMassKg * 2.20462
  const fatMassKg = weightKg - leanMassKg
  const fatMassLbs = fatMassKg * 2.20462

  return {
    value: unit === 'imperial' ? Math.round(leanMassLbs) : Math.round(leanMassKg),
    unit: unit === 'imperial' ? 'lbs' : 'kg',
    breakdown: [
      { label: 'Total Weight', value: unit === 'imperial' ? `${weight} lbs` : `${weightKg.toFixed(1)} kg` },
      { label: 'Body Fat %', value: `${bodyFat}%` },
      { label: 'Fat Mass', value: unit === 'imperial' ? `${Math.round(fatMassLbs)} lbs` : `${Math.round(fatMassKg)} kg` },
      { label: 'Lean Body Mass', value: unit === 'imperial' ? `${Math.round(leanMassLbs)} lbs` : `${Math.round(leanMassKg)} kg` },
      { label: 'LBM Percentage', value: `${(100 - bodyFat).toFixed(1)}%` },
    ],
    recommendations: [
      `Your lean body mass is ${unit === 'imperial' ? `${Math.round(leanMassLbs)} lbs` : `${Math.round(leanMassKg)} kg`} (${(100 - bodyFat).toFixed(1)}% of total weight)`,
      'LBM includes: Muscle, bones, organs, and water - everything except fat',
      'Build muscle: Focus on resistance training 3-4x per week to increase LBM',
      'Protein intake: Ensure adequate protein (1.6-2.2g per kg body weight) to support muscle growth',
      'Track changes: Monitor LBM over time - increasing it while reducing fat is ideal',
      'Body recomposition: Aim to lose fat while maintaining or gaining lean mass',
      '💡 Next step: Use our Protein Calculator to ensure optimal protein for muscle growth',
      '💡 Related tools: Body Fat Calculator, Training Volume Calculator, One Rep Max Calculator',
    ],
  }
}

// Training Volume Calculator
export function calculateTrainingVolume(sets: number, reps: number, weight: number, unit: string): CalculatorResult {
  const weightKg = unit === 'imperial' ? weight * 0.453592 : weight
  const volumeKg = sets * reps * weightKg
  const volumeLbs = volumeKg * 2.20462

  const volumePerSet = reps * weightKg
  const avgVolumePerSet = volumeKg / sets

  return {
    value: unit === 'imperial' ? Math.round(volumeLbs) : Math.round(volumeKg),
    unit: unit === 'imperial' ? 'lbs' : 'kg',
    breakdown: [
      { label: 'Sets', value: sets },
      { label: 'Reps per Set', value: reps },
      { label: 'Weight per Rep', value: unit === 'imperial' ? `${weight} lbs` : `${weightKg.toFixed(1)} kg` },
      { label: 'Volume per Set', value: unit === 'imperial' ? `${Math.round(volumePerSet * 2.20462)} lbs` : `${Math.round(volumePerSet)} kg` },
      { label: 'Total Volume', value: unit === 'imperial' ? `${Math.round(volumeLbs)} lbs` : `${Math.round(volumeKg)} kg` },
    ],
    recommendations: [
      `Your total training volume is ${unit === 'imperial' ? `${Math.round(volumeLbs)} lbs` : `${Math.round(volumeKg)} kg`} (${sets} sets × ${reps} reps × ${unit === 'imperial' ? weight : weightKg.toFixed(1)}${unit === 'imperial' ? 'lbs' : 'kg'})`,
      'Progressive overload: Gradually increase volume each week (add 2.5-5% more weight or 1-2 reps)',
      'Track consistently: Log your volume to monitor progress over time',
      'Volume ranges: 10-20 sets per muscle group per week is optimal for most trainees',
      'Recovery matters: Allow adequate rest between sessions - more volume requires more recovery',
      'Quality over quantity: Focus on proper form and controlled reps rather than just high volume',
      '💡 Next step: Use our One Rep Max Calculator to find your strength potential',
      '💡 Related tools: One Rep Max Calculator, Protein Calculator, Lean Body Mass Calculator',
    ],
  }
}

