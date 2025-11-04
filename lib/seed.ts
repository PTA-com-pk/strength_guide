import 'dotenv/config'
import connectDB from './mongodb'
import Author from '@/models/Author'
import Category from '@/models/Category'
import Tag from '@/models/Tag'
import Article from '@/models/Article'

async function main() {
  console.log('Starting seed...')

  await connectDB()

  // Clear existing data (optional - comment out if you want to keep existing data)
  // NOTE: Commenting out deleteMany to preserve scraped articles
  // If you need to reset, uncomment these lines
  // await Article.deleteMany({})
  // await Comment.deleteMany({})
  // await Tag.deleteMany({})
  // await Category.deleteMany({})
  // await Author.deleteMany({})

  // Create Authors
  const author1 = await Author.findOneAndUpdate(
    { email: 'john.doe@example.com' },
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      bio: 'Certified personal trainer with 10+ years of experience in strength training and nutrition.',
      socialLinks: {
        twitter: 'https://twitter.com/johndoe',
        instagram: 'https://instagram.com/johndoe',
      },
    },
    { upsert: true, new: true }
  )

  const author2 = await Author.findOneAndUpdate(
    { email: 'jane.smith@example.com' },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      bio: 'Nutritionist and fitness coach specializing in weight loss and body composition.',
      socialLinks: {
        twitter: 'https://twitter.com/janesmith',
        youtube: 'https://youtube.com/janesmith',
      },
    },
    { upsert: true, new: true }
  )

  console.log('Created authors:', { author1, author2 })

  // Create Categories
  const categoriesData = [
    {
      name: 'Muscle Building',
      slug: 'muscle-building',
      description: 'Learn how to build muscle mass effectively with proven training methods.',
    },
    {
      name: 'Fat Loss',
      slug: 'fat-loss',
      description: 'Strategies and tips for losing fat while preserving muscle mass.',
    },
    {
      name: 'Nutrition',
      slug: 'nutrition',
      description: 'Everything you need to know about nutrition for optimal performance.',
    },
    {
      name: 'Training',
      slug: 'training',
      description: 'Training programs, techniques, and workout plans.',
    },
    {
      name: 'Supplements',
      slug: 'supplements',
      description: 'Evidence-based information about supplements and their benefits.',
    },
    {
      name: 'Workouts',
      slug: 'workouts',
      description: 'Ready-to-use workout plans for different goals and fitness levels.',
    },
  ]

  const createdCategories = []
  for (const categoryData of categoriesData) {
    const category = await Category.findOneAndUpdate(
      { slug: categoryData.slug },
      categoryData,
      { upsert: true, new: true }
    )
    createdCategories.push(category)
  }

  console.log('Created categories:', createdCategories.length)

  // Create Tags
  const tagsData = [
    'beginner',
    'advanced',
    'home-workout',
    'gym',
    'protein',
    'cardio',
    'strength',
    'hypertrophy',
    'diet',
    'recovery',
  ]

  const createdTags = []
  for (const tagName of tagsData) {
    const tag = await Tag.findOneAndUpdate(
      { slug: tagName },
      {
        name: tagName.charAt(0).toUpperCase() + tagName.slice(1),
        slug: tagName,
      },
      { upsert: true, new: true }
    )
    createdTags.push(tag)
  }

  console.log('Created tags:', createdTags.length)

  // Create Sample Articles
  const articlesData = [
    {
      title: 'The Ultimate Guide to Building Muscle Mass',
      slug: 'ultimate-guide-building-muscle-mass',
      excerpt:
        'Discover the science-backed methods to build muscle effectively. Learn about progressive overload, nutrition, and recovery strategies.',
      content: `
        <h2>Introduction</h2>
        <p>Building muscle mass is a goal shared by many fitness enthusiasts. However, achieving significant muscle growth requires more than just lifting weights. In this comprehensive guide, we'll explore the key principles of muscle building that have been proven effective through scientific research and real-world application.</p>
        
        <p>Whether you're a beginner just starting your fitness journey or an experienced lifter looking to break through a plateau, understanding these fundamental concepts will help you maximize your muscle-building potential. Let's dive into the science-backed strategies that actually work.</p>

        <h2>Progressive Overload: The Foundation of Growth</h2>
        <p>Progressive overload is the foundation of muscle growth. This principle states that you must continually increase the demands on your muscles to see progress. Without progressive overload, your body has no reason to adapt and grow stronger.</p>
        
        <p>Think of your muscles as incredibly efficient machines. They adapt quickly to the stress you place on them. If you continue lifting the same weight for the same number of reps week after week, your muscles will stop growing because they've already adapted to that level of stress.</p>
        
        <p>This can be achieved through several methods:</p>
        <ul>
          <li>Increasing the weight you lift - This is the most common method. Adding 2.5-5 pounds to your lifts each week can lead to significant progress over time.</li>
          <li>Increasing the number of repetitions - If you can do more reps with the same weight, you're getting stronger.</li>
          <li>Increasing the number of sets - More volume can stimulate additional growth, especially for advanced lifters.</li>
          <li>Reducing rest time between sets - This increases the intensity and metabolic stress.</li>
          <li>Improving form and range of motion - Better technique means more muscle activation.</li>
        </ul>

        <h2>Nutrition for Muscle Growth</h2>
        <p>Proper nutrition is crucial for muscle building. You need to consume adequate protein, carbohydrates, and healthy fats to support muscle repair and growth. Without proper nutrition, even the best training program will fall short.</p>
        
        <p>Protein is the building block of muscle tissue. When you train, you create microscopic tears in your muscle fibers. Protein provides the amino acids needed to repair these tears and build them back stronger and larger. Research suggests that active individuals need 0.7-1 gram of protein per pound of bodyweight daily.</p>
        
        <p>Carbohydrates are equally important. They provide the energy needed for intense training sessions and help replenish glycogen stores in your muscles. Without adequate carbs, you won't have the energy to train hard enough to stimulate growth.</p>
        
        <p>Healthy fats support hormone production, including testosterone, which plays a crucial role in muscle building. Include sources like avocados, nuts, olive oil, and fatty fish in your diet.</p>

        <h2>Training Volume and Frequency</h2>
        <p>Training volume refers to the total amount of work you do - sets multiplied by reps multiplied by weight. Research suggests that 10-20 sets per muscle group per week is optimal for most people. However, this can vary based on your training experience and recovery capacity.</p>
        
        <p>Training frequency matters too. Most muscle groups respond well to being trained 2-3 times per week. This allows for adequate recovery while maintaining frequent stimulation for growth.</p>
        
        <p>For beginners, a full-body workout performed 3 times per week is ideal. As you advance, you might move to an upper/lower split or a push/pull/legs routine that allows for more volume per muscle group.</p>

        <h2>Recovery: When Muscles Actually Grow</h2>
        <p>Muscles grow during rest, not during training. Ensure you get adequate sleep and allow sufficient recovery time between training sessions. When you lift weights, you're breaking down muscle tissue. It's during rest that your body repairs and rebuilds this tissue, making it stronger and larger.</p>
        
        <p>Sleep is particularly important. During deep sleep, your body releases growth hormone, which is essential for muscle repair and growth. Aim for 7-9 hours of quality sleep per night. Poor sleep can significantly impair your muscle-building progress.</p>
        
        <p>Active recovery can also be beneficial. Light activities like walking, stretching, or yoga on rest days can improve blood flow and aid recovery without interfering with muscle repair.</p>

        <h2>Putting It All Together</h2>
        <p>Building muscle is a process that requires consistency, patience, and attention to detail. Focus on progressive overload in your training, eat enough protein and calories to support growth, get adequate sleep, and allow time for recovery. Remember, results take time - most people can expect to gain 1-2 pounds of muscle per month under optimal conditions.</p>
        
        <p>Track your progress with photos, measurements, and strength gains. If you're not seeing progress after 4-6 weeks, reassess your training, nutrition, and recovery strategies. Small adjustments can make a big difference in your results.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200',
      publishedAt: new Date('2024-01-15'),
      views: 15234,
      authorId: author1._id,
      categoryId: createdCategories[0]._id,
      tagIds: [createdTags[0]._id, createdTags[6]._id, createdTags[7]._id],
    },
    {
      title: '10 Effective Fat Loss Strategies That Actually Work',
      slug: '10-effective-fat-loss-strategies',
      excerpt:
        'Cut through the noise and learn proven fat loss strategies backed by science. No gimmicks, just results.',
      content: `
        <h2>1. Create a Calorie Deficit</h2>
        <p>The fundamental principle of fat loss is consuming fewer calories than you burn. However, this doesn't mean starving yourself. A moderate deficit of 300-500 calories per day is sustainable and preserves muscle mass.</p>
        
        <p>Creating too large of a deficit can backfire. Your body will slow down your metabolism, decrease energy levels, and you'll likely lose muscle along with fat. A moderate deficit allows for steady, sustainable fat loss while preserving your hard-earned muscle.</p>
        
        <p>Track your calories initially to understand your intake, but don't become obsessive. Many people find success with intuitive eating once they understand portion sizes and food choices.</p>
        
        <h2>2. Prioritize Protein</h2>
        <p>High-protein diets help preserve muscle mass during weight loss and increase satiety, making it easier to stick to your calorie goals. Protein has the highest thermic effect of food, meaning your body burns more calories digesting it compared to carbs or fats.</p>
        
        <p>Aim for 0.8-1 gram of protein per pound of bodyweight when cutting. This might seem like a lot, but protein is crucial for maintaining muscle mass during a calorie deficit. Good sources include lean meats, fish, eggs, dairy, legumes, and protein supplements if needed.</p>
        
        <p>Spreading protein intake throughout the day is also important. Try to include protein in every meal to maximize muscle protein synthesis and keep you feeling full.</p>
        
        <h2>3. Strength Training</h2>
        <p>Don't skip the weights! Strength training helps maintain muscle mass and can boost your metabolism. Many people make the mistake of focusing only on cardio when trying to lose fat, but this can lead to significant muscle loss.</p>
        
        <p>Maintain your training volume and intensity during a cut. You might not be able to increase strength, but you should be able to maintain it. This sends a signal to your body to preserve muscle tissue even in a calorie deficit.</p>
        
        <p>Compound movements like squats, deadlifts, bench press, and rows should remain the foundation of your program. These movements work multiple muscle groups and burn more calories than isolation exercises.</p>
        
        <h2>4. Get Enough Sleep</h2>
        <p>Poor sleep can disrupt hormones that regulate appetite and metabolism, making fat loss more difficult. When you're sleep-deprived, your body produces more ghrelin (hunger hormone) and less leptin (satiety hormone), making you feel hungrier.</p>
        
        <p>Lack of sleep also increases cortisol levels, which can promote fat storage, especially around the midsection. Additionally, you'll have less energy for workouts and recovery.</p>
        
        <p>Aim for 7-9 hours of quality sleep per night. Create a sleep routine, avoid screens before bed, and keep your bedroom cool and dark for optimal sleep quality.</p>
        
        <h2>5. Stay Hydrated</h2>
        <p>Drinking water can boost metabolism and help you feel full, reducing overall calorie intake. Sometimes thirst is mistaken for hunger, so staying hydrated can prevent unnecessary snacking.</p>
        
        <p>Drinking water before meals can also help reduce calorie intake. Studies show that people who drink water before meals consume fewer calories overall. Aim for at least half your bodyweight in ounces of water daily, more if you're active.</p>
        
        <p>Water also plays a role in fat metabolism. Proper hydration is essential for your body to efficiently burn fat for energy.</p>
        
        <h2>6. Manage Stress</h2>
        <p>Chronic stress elevates cortisol levels, which can promote fat storage and make it harder to lose weight. Find healthy ways to manage stress, such as meditation, yoga, or hobbies you enjoy.</p>
        
        <h2>7. Be Patient and Consistent</h2>
        <p>Fat loss takes time. Don't expect to see results overnight. Focus on being consistent with your nutrition and training, and the results will come. Small, sustainable changes lead to long-term success.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200',
      publishedAt: new Date('2024-01-20'),
      views: 9845,
      authorId: author2._id,
      categoryId: createdCategories[1]._id,
      tagIds: [createdTags[0]._id, createdTags[5]._id, createdTags[8]._id],
    },
    {
      title: 'Pre-Workout Nutrition: What to Eat Before Training',
      slug: 'pre-workout-nutrition-guide',
      excerpt:
        'Optimize your workouts with proper pre-workout nutrition. Learn what to eat and when to eat it for maximum performance.',
      content: `
        <h2>Timing is Everything</h2>
        <p>When you eat before a workout can be just as important as what you eat. Generally, you should eat 1-3 hours before training to allow for proper digestion while ensuring you have energy available.</p>
        
        <p>If you eat too close to your workout, you might experience digestive discomfort or feel sluggish. If you eat too far in advance, you might run out of energy mid-workout. Finding your personal sweet spot is key.</p>
        
        <p>Some people prefer to train fasted, especially for morning workouts. This can work well for low-intensity sessions, but for high-intensity training, having some fuel in the tank is usually beneficial.</p>
        
        <h2>What to Eat</h2>
        <p>Focus on easily digestible carbohydrates and moderate protein. Avoid high-fat foods as they can slow digestion and sit heavy in your stomach during exercise.</p>
        
        <p>Carbohydrates are your primary fuel source for high-intensity exercise. Your body converts carbs into glucose, which is stored as glycogen in your muscles and liver. This glycogen is what powers your workouts.</p>
        
        <p>A small amount of protein (10-20 grams) can help prevent muscle breakdown during training and support recovery. However, don't overdo it - too much protein before a workout can cause digestive issues.</p>
        
        <h2>Pre-Workout Meal Ideas</h2>
        <p>Here are some tried-and-true pre-workout meal options that provide sustained energy without causing digestive distress:</p>
        <ul>
          <li>Banana with almond butter - Quick carbs and a bit of healthy fat</li>
          <li>Oatmeal with berries - Complex carbs that provide sustained energy</li>
          <li>Greek yogurt with granola - Protein and carbs in one convenient package</li>
          <li>Rice cakes with honey - Fast-digesting carbs for quick energy</li>
          <li>Apple with a handful of nuts - Natural sugars plus healthy fats</li>
          <li>Whole grain toast with jam - Simple and effective</li>
        </ul>
        
        <h2>Hydration Matters Too</h2>
        <p>Don't forget about hydration! Start hydrating 2-3 hours before your workout. Drink 16-20 ounces of water, then another 8-10 ounces 15-30 minutes before you start. During your workout, sip water as needed.</p>
        
        <p>For intense workouts lasting longer than an hour, consider a sports drink or electrolyte supplement to maintain performance and prevent cramping.</p>
        
        <h2>Experiment to Find What Works</h2>
        <p>Everyone is different. What works for one person might not work for you. Experiment with different foods and timing to find what makes you feel energized and perform your best. Keep a training log to track how different pre-workout meals affect your performance.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200',
      publishedAt: new Date('2024-01-25'),
      views: 7234,
      authorId: author1._id,
      categoryId: createdCategories[2]._id,
      tagIds: [createdTags[4]._id, createdTags[8]._id],
    },
    {
      title: 'The Best 5-Day Split Workout Routine for Muscle Growth',
      slug: 'best-5-day-split-workout-routine',
      excerpt:
        'A comprehensive 5-day split routine designed to maximize muscle growth. Perfect for intermediate to advanced lifters.',
      content: `
        <h2>Day 1: Chest and Triceps</h2>
        <p>Focus on compound movements like bench press, followed by isolation exercises for triceps.</p>
        
        <h2>Day 2: Back and Biceps</h2>
        <p>Deadlifts, rows, and pull-ups for back, followed by bicep curls and hammer curls.</p>
        
        <h2>Day 3: Legs</h2>
        <p>Squats, leg press, leg curls, and calf raises for complete lower body development.</p>
        
        <h2>Day 4: Shoulders and Abs</h2>
        <p>Overhead press, lateral raises, and various ab exercises.</p>
        
        <h2>Day 5: Arms</h2>
        <p>An arm-focused day with supersets and high volume training.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f0b1?w=1200',
      publishedAt: new Date('2024-02-01'),
      views: 11234,
      authorId: author1._id,
      categoryId: createdCategories[5]._id,
      tagIds: [createdTags[1]._id, createdTags[3]._id, createdTags[7]._id],
    },
    {
      title: 'Protein Supplements: Do You Really Need Them?',
      slug: 'protein-supplements-guide',
      excerpt:
        'Cut through the marketing hype and learn the truth about protein supplements. When are they useful, and when can you skip them?',
      content: `
        <h2>What Are Protein Supplements?</h2>
        <p>Protein supplements are concentrated sources of protein, typically derived from whey, casein, soy, or plant sources.</p>
        
        <h2>Do You Need Them?</h2>
        <p>Protein supplements are convenient but not necessary if you can meet your protein needs through whole foods. However, they can be helpful for:</p>
        <ul>
          <li>Athletes with high protein requirements</li>
          <li>People with busy schedules</li>
          <li>Vegetarians and vegans</li>
          <li>Those struggling to meet protein goals</li>
        </ul>
        
        <h2>Best Time to Take Protein</h2>
        <p>While timing isn't critical, consuming protein post-workout can support muscle recovery and growth.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200',
      publishedAt: new Date('2024-02-05'),
      views: 8765,
      authorId: author2._id,
      categoryId: createdCategories[4]._id,
      tagIds: [createdTags[4]._id, createdTags[0]._id],
    },
    // Additional articles across different categories
    {
      title: 'How to Build Muscle at Home: No Gym Required',
      slug: 'build-muscle-at-home-no-gym',
      excerpt:
        'Discover effective bodyweight exercises and home workout routines that can help you build muscle without expensive gym equipment.',
      content: `
        <h2>Bodyweight Exercises That Build Muscle</h2>
        <p>You don't need a gym membership to build muscle. These bodyweight exercises target all major muscle groups effectively.</p>
        
        <h2>Push-Ups and Variations</h2>
        <p>Push-ups are excellent for building chest, shoulders, and triceps. Try variations like diamond push-ups, decline push-ups, and archer push-ups.</p>
        
        <h2>Pull-Ups and Chin-Ups</h2>
        <p>If you have a pull-up bar, these exercises are fantastic for building back and biceps. If not, use resistance bands or door frame pull-up bars.</p>
        
        <h2>Squats and Lunges</h2>
        <p>Lower body strength comes from squats, lunges, and their many variations. Add weight with household items if needed.</p>
        
        <h2>Home Workout Schedule</h2>
        <p>Aim for 3-4 workouts per week, focusing on progressive overload by increasing reps or difficulty over time.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200',
      publishedAt: new Date('2024-02-10'),
      views: 9234,
      authorId: author1._id,
      categoryId: createdCategories[0]._id,
      tagIds: [createdTags[0]._id, createdTags[2]._id, createdTags[6]._id],
    },
    {
      title: 'HIIT Workouts: Burn Fat Faster in Less Time',
      slug: 'hiit-workouts-burn-fat-faster',
      excerpt:
        'High-Intensity Interval Training (HIIT) is one of the most efficient ways to burn fat and improve cardiovascular fitness. Learn how to structure effective HIIT sessions.',
      content: `
        <h2>What is HIIT?</h2>
        <p>HIIT involves short bursts of intense exercise followed by brief recovery periods. This approach maximizes calorie burn and improves fitness faster than steady-state cardio.</p>
        
        <h2>Benefits of HIIT</h2>
        <ul>
          <li>Burns more calories in less time</li>
          <li>Increases metabolism for hours after workout</li>
          <li>Improves cardiovascular health</li>
          <li>Preserves muscle mass during fat loss</li>
        </ul>
        
        <h2>Sample HIIT Workout</h2>
        <p>Warm up for 5 minutes, then alternate 30 seconds of maximum effort with 30 seconds of rest. Repeat 8-10 times, then cool down.</p>
        
        <h2>HIIT Exercises</h2>
        <p>Burpees, mountain climbers, jumping jacks, high knees, and sprint intervals are all excellent HIIT exercises.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f0b1?w=1200',
      publishedAt: new Date('2024-02-12'),
      views: 8456,
      authorId: author2._id,
      categoryId: createdCategories[1]._id,
      tagIds: [createdTags[0]._id, createdTags[5]._id, createdTags[2]._id],
    },
    {
      title: 'Meal Prep Guide: Save Time and Eat Healthy',
      slug: 'meal-prep-guide-save-time-eat-healthy',
      excerpt:
        'Master the art of meal prep to save time, money, and ensure you always have healthy meals ready. This comprehensive guide covers everything you need to know.',
      content: `
        <h2>Why Meal Prep?</h2>
        <p>Meal prepping saves time during busy weeks, helps you stick to your nutrition goals, and reduces the temptation to order unhealthy takeout.</p>
        
        <h2>Getting Started</h2>
        <p>Start with one meal type (like lunches) and gradually expand. Invest in quality containers that are microwave and dishwasher safe.</p>
        
        <h2>Meal Prep Strategies</h2>
        <ul>
          <li>Prep ingredients vs. full meals</li>
          <li>Batch cooking proteins</li>
          <li>Pre-cut vegetables</li>
          <li>Pre-portioned snacks</li>
        </ul>
        
        <h2>Sample Meal Prep Menu</h2>
        <p>Grilled chicken, roasted vegetables, quinoa, and hard-boiled eggs can all be prepped in advance for easy assembly throughout the week.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200',
      publishedAt: new Date('2024-02-15'),
      views: 11234,
      authorId: author2._id,
      categoryId: createdCategories[2]._id,
      tagIds: [createdTags[0]._id, createdTags[8]._id],
    },
    {
      title: 'Progressive Overload: The Key to Continuous Gains',
      slug: 'progressive-overload-key-to-gains',
      excerpt:
        'Understanding progressive overload is crucial for long-term muscle growth and strength gains. Learn how to systematically increase training intensity.',
      content: `
        <h2>What is Progressive Overload?</h2>
        <p>Progressive overload means gradually increasing the demands on your muscles over time. This forces adaptation and continuous improvement.</p>
        
        <h2>Methods of Progressive Overload</h2>
        <ul>
          <li>Increase weight</li>
          <li>Increase repetitions</li>
          <li>Increase sets</li>
          <li>Decrease rest time</li>
          <li>Improve form and range of motion</li>
        </ul>
        
        <h2>Tracking Your Progress</h2>
        <p>Keep a training log to track weights, reps, and sets. This helps you ensure you're progressing consistently.</p>
        
        <h2>Common Mistakes</h2>
        <p>Avoid progressing too quickly, which can lead to injury. Aim for small, consistent increases over time.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200',
      publishedAt: new Date('2024-02-18'),
      views: 9876,
      authorId: author1._id,
      categoryId: createdCategories[3]._id,
      tagIds: [createdTags[1]._id, createdTags[6]._id, createdTags[7]._id],
    },
    {
      title: 'Creatine Supplementation: Science-Backed Benefits',
      slug: 'creatine-supplementation-benefits',
      excerpt:
        'Creatine is one of the most researched supplements in sports nutrition. Discover how it can enhance your strength, power, and muscle mass.',
      content: `
        <h2>What is Creatine?</h2>
        <p>Creatine is a natural compound found in muscle cells that helps produce energy during high-intensity exercise.</p>
        
        <h2>Proven Benefits</h2>
        <ul>
          <li>Increases strength and power output</li>
          <li>Enhances muscle mass gains</li>
          <li>Improves high-intensity exercise performance</li>
          <li>May support brain health</li>
        </ul>
        
        <h2>How to Take Creatine</h2>
        <p>Take 3-5 grams daily. You can do a loading phase (20g/day for 5-7 days) or simply take 3-5g daily - both methods work equally well over time.</p>
        
        <h2>Safety and Side Effects</h2>
        <p>Creatine is safe for most people. Some may experience minor bloating or stomach discomfort, which usually subsides.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200',
      publishedAt: new Date('2024-02-20'),
      views: 7567,
      authorId: author1._id,
      categoryId: createdCategories[4]._id,
      tagIds: [createdTags[0]._id, createdTags[4]._id],
    },
    {
      title: 'Full Body Workout: Build Strength in One Session',
      slug: 'full-body-workout-build-strength',
      excerpt:
        'This comprehensive full-body workout targets all major muscle groups in a single session. Perfect for those with limited time or training 2-3 times per week.',
      content: `
        <h2>Why Full Body Workouts?</h2>
        <p>Full body workouts are efficient, allow for frequent muscle stimulation, and are ideal for beginners or those with limited training time.</p>
        
        <h2>Workout Structure</h2>
        <p>Perform 3-4 sets of 8-12 reps for each exercise. Rest 60-90 seconds between sets.</p>
        
        <h2>Exercise Selection</h2>
        <ul>
          <li>Squats - Lower body</li>
          <li>Bench Press - Chest and triceps</li>
          <li>Bent-Over Rows - Back and biceps</li>
          <li>Overhead Press - Shoulders</li>
          <li>Deadlifts - Posterior chain</li>
        </ul>
        
        <h2>Training Frequency</h2>
        <p>Perform this workout 2-3 times per week with at least one rest day between sessions.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f0b1?w=1200',
      publishedAt: new Date('2024-02-22'),
      views: 10345,
      authorId: author1._id,
      categoryId: createdCategories[5]._id,
      tagIds: [createdTags[0]._id, createdTags[3]._id, createdTags[6]._id],
    },
    {
      title: 'Intermittent Fasting for Fat Loss: Complete Guide',
      slug: 'intermittent-fasting-fat-loss-guide',
      excerpt:
        'Intermittent fasting has gained popularity as an effective fat loss strategy. Learn the different methods and how to implement them safely.',
      content: `
        <h2>What is Intermittent Fasting?</h2>
        <p>Intermittent fasting involves cycling between periods of eating and fasting. It's not about what you eat, but when you eat.</p>
        
        <h2>Popular Methods</h2>
        <ul>
          <li>16/8 Method - Fast for 16 hours, eat within 8-hour window</li>
          <li>5:2 Method - Eat normally 5 days, restrict calories 2 days</li>
          <li>Eat-Stop-Eat - 24-hour fasts once or twice per week</li>
        </ul>
        
        <h2>Benefits</h2>
        <p>May aid weight loss, improve insulin sensitivity, and support cellular repair processes.</p>
        
        <h2>Who Should Avoid It?</h2>
        <p>Pregnant women, those with eating disorders, or individuals with certain medical conditions should consult a doctor first.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200',
      publishedAt: new Date('2024-02-25'),
      views: 13456,
      authorId: author2._id,
      categoryId: createdCategories[1]._id,
      tagIds: [createdTags[0]._id, createdTags[8]._id],
    },
    {
      title: 'Macronutrients Explained: Protein, Carbs, and Fats',
      slug: 'macronutrients-explained-protein-carbs-fats',
      excerpt:
        'Understanding macronutrients is fundamental to proper nutrition. Learn what protein, carbohydrates, and fats do for your body and how much you need.',
      content: `
        <h2>Protein</h2>
        <p>Protein is essential for muscle repair and growth. Aim for 0.8-1g per pound of bodyweight, or more if you're very active.</p>
        
        <h2>Carbohydrates</h2>
        <p>Carbs are your body's primary energy source. Choose complex carbs like whole grains, fruits, and vegetables over refined sugars.</p>
        
        <h2>Fats</h2>
        <p>Healthy fats support hormone production and nutrient absorption. Focus on sources like avocados, nuts, olive oil, and fatty fish.</p>
        
        <h2>Macro Ratios</h2>
        <p>There's no one-size-fits-all ratio. Active individuals might benefit from higher carbs, while those in a cutting phase may reduce them.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200',
      publishedAt: new Date('2024-02-28'),
      views: 10987,
      authorId: author2._id,
      categoryId: createdCategories[2]._id,
      tagIds: [createdTags[0]._id, createdTags[4]._id, createdTags[8]._id],
    },
    {
      title: 'Deadlift Technique: Master the King of Lifts',
      slug: 'deadlift-technique-master-the-king',
      excerpt:
        'The deadlift is one of the most effective exercises for building overall strength. Learn proper form, common mistakes, and how to progress safely.',
      content: `
        <h2>Why Deadlifts?</h2>
        <p>Deadlifts work multiple muscle groups simultaneously, building strength in your back, glutes, hamstrings, and core.</p>
        
        <h2>Proper Form</h2>
        <ul>
          <li>Feet hip-width apart, bar over mid-foot</li>
          <li>Hinge at hips, keep back straight</li>
          <li>Grip bar just outside legs</li>
          <li>Drive through heels, extend hips and knees</li>
          <li>Keep bar close to body throughout movement</li>
        </ul>
        
        <h2>Common Mistakes</h2>
        <p>Avoid rounding your back, letting the bar drift away from your body, or hyperextending at the top.</p>
        
        <h2>Progressing Safely</h2>
        <p>Start with lighter weights to master form, then gradually increase. Add 5-10 pounds per week as you get stronger.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200',
      publishedAt: new Date('2024-03-01'),
      views: 14234,
      authorId: author1._id,
      categoryId: createdCategories[3]._id,
      tagIds: [createdTags[1]._id, createdTags[3]._id, createdTags[6]._id],
    },
    {
      title: 'Push-Pull-Legs Split: The Ultimate Training Program',
      slug: 'push-pull-legs-split-ultimate-program',
      excerpt:
        'The PPL split is one of the most popular and effective training splits. Learn how to structure your workouts for maximum muscle growth.',
      content: `
        <h2>What is PPL?</h2>
        <p>Push-Pull-Legs divides your training into three categories: pushing movements (chest, shoulders, triceps), pulling movements (back, biceps), and legs.</p>
        
        <h2>Benefits</h2>
        <ul>
          <li>Allows for high training frequency</li>
          <li>Prevents overtraining specific muscle groups</li>
          <li>Great for intermediate to advanced lifters</li>
          <li>Highly customizable</li>
        </ul>
        
        <h2>Sample Schedule</h2>
        <p>Monday: Push, Tuesday: Pull, Wednesday: Legs, Thursday: Rest, Friday: Push, Saturday: Pull, Sunday: Legs</p>
        
        <h2>Exercise Selection</h2>
        <p>Focus on compound movements first, then add isolation exercises. Aim for 3-4 exercises per muscle group per session.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f0b1?w=1200',
      publishedAt: new Date('2024-03-05'),
      views: 15678,
      authorId: author1._id,
      categoryId: createdCategories[5]._id,
      tagIds: [createdTags[1]._id, createdTags[3]._id, createdTags[7]._id],
    },
    {
      title: 'BCAA vs EAA: Which Amino Acids Do You Need?',
      slug: 'bcaa-vs-eaa-amino-acids-guide',
      excerpt:
        'Branched-chain amino acids (BCAAs) and essential amino acids (EAAs) are popular supplements. Learn the differences and which might benefit you.',
      content: `
        <h2>What are BCAAs?</h2>
        <p>BCAAs include leucine, isoleucine, and valine - three of the nine essential amino acids. They're particularly important for muscle protein synthesis.</p>
        
        <h2>What are EAAs?</h2>
        <p>EAAs include all nine essential amino acids your body can't produce. They're necessary for complete protein synthesis.</p>
        
        <h2>Which Should You Take?</h2>
        <p>If you're eating adequate protein (1g+ per pound), you likely don't need either. EAAs are more complete than BCAAs, but both are unnecessary if your diet is on point.</p>
        
        <h2>When They Might Help</h2>
        <p>BCAAs or EAAs might be useful during fasted training or if you're unable to eat protein around your workout.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200',
      publishedAt: new Date('2024-03-08'),
      views: 7234,
      authorId: author2._id,
      categoryId: createdCategories[4]._id,
      tagIds: [createdTags[0]._id, createdTags[4]._id],
    },
    {
      title: 'How Much Protein Do You Really Need?',
      slug: 'how-much-protein-do-you-really-need',
      excerpt:
        'Protein needs vary based on activity level, goals, and body composition. Cut through the confusion and learn optimal protein intake for your situation.',
      content: `
        <h2>General Recommendations</h2>
        <p>Sedentary individuals: 0.8g per kg bodyweight. Active individuals: 1.2-1.6g per kg. Strength athletes: 1.6-2.2g per kg.</p>
        
        <h2>For Muscle Building</h2>
        <p>Research suggests 1.6-2.2g per kg (0.7-1g per pound) is optimal for maximizing muscle protein synthesis in most people.</p>
        
        <h2>For Fat Loss</h2>
        <p>Higher protein intake (up to 2.5g per kg) can help preserve muscle mass during calorie restriction and increase satiety.</p>
        
        <h2>Timing Matters Less Than Total</h2>
        <p>While timing can be optimized, total daily protein intake is more important than when you consume it.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200',
      publishedAt: new Date('2024-03-10'),
      views: 18945,
      authorId: author2._id,
      categoryId: createdCategories[2]._id,
      tagIds: [createdTags[0]._id, createdTags[4]._id, createdTags[8]._id],
    },
    {
      title: 'Bulking vs Cutting: When to Do Each',
      slug: 'bulking-vs-cutting-when-to-do-each',
      excerpt:
        'Understanding when to bulk (gain muscle) versus cut (lose fat) is crucial for achieving your physique goals. Learn the strategies for each phase.',
      content: `
        <h2>What is Bulking?</h2>
        <p>Bulking involves eating in a calorie surplus to support muscle growth. Typically, you'll gain both muscle and some fat.</p>
        
        <h2>What is Cutting?</h2>
        <p>Cutting involves eating in a calorie deficit to lose fat while preserving muscle mass through resistance training and adequate protein.</p>
        
        <h2>When to Bulk</h2>
        <p>If you're relatively lean (under 15% body fat for men, 25% for women) and want to build muscle, a bulk phase makes sense.</p>
        
        <h2>When to Cut</h2>
        <p>If you've gained significant fat or want to reveal muscle definition, a cutting phase is appropriate.</p>
        
        <h2>Cycling Approach</h2>
        <p>Many successful lifters alternate between bulking and cutting phases throughout the year to maximize results.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200',
      publishedAt: new Date('2024-03-12'),
      views: 16789,
      authorId: author1._id,
      categoryId: createdCategories[0]._id,
      tagIds: [createdTags[0]._id, createdTags[6]._id, createdTags[7]._id],
    },
    {
      title: 'Cardio for Weight Loss: Myths and Facts',
      slug: 'cardio-weight-loss-myths-facts',
      excerpt:
        'Cardio is often misunderstood in the context of weight loss. Learn what the science says about cardio, fat loss, and muscle preservation.',
      content: `
        <h2>Cardio and Weight Loss</h2>
        <p>Cardio burns calories and can aid weight loss, but it's not the only factor. Diet is more important for fat loss.</p>
        
        <h2>Cardio vs Strength Training</h2>
        <p>While cardio burns calories during exercise, strength training increases muscle mass, which boosts metabolism long-term.</p>
        
        <h2>Best Approach</h2>
        <p>Combine both: strength training to build muscle and cardio for cardiovascular health and additional calorie burn.</p>
        
        <h2>How Much Cardio?</h2>
        <p>150-300 minutes of moderate-intensity cardio per week is recommended for general health. Adjust based on your goals.</p>
        
        <h2>Cardio Myths</h2>
        <p>You don't need to do cardio on an empty stomach, and steady-state cardio isn't inherently better than HIIT for fat loss.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f0b1?w=1200',
      publishedAt: new Date('2024-03-15'),
      views: 12456,
      authorId: author2._id,
      categoryId: createdCategories[1]._id,
      tagIds: [createdTags[0]._id, createdTags[5]._id],
    },
    // Even more articles for better content distribution
    {
      title: 'Compound vs Isolation Exercises: Which Should You Do?',
      slug: 'compound-vs-isolation-exercises',
      excerpt:
        'Understanding the difference between compound and isolation exercises is key to designing an effective workout program. Learn when to use each type.',
      content: `
        <h2>What are Compound Exercises?</h2>
        <p>Compound exercises work multiple muscle groups simultaneously. Examples include squats, deadlifts, bench press, and pull-ups.</p>
        
        <h2>What are Isolation Exercises?</h2>
        <p>Isolation exercises target a single muscle group. Examples include bicep curls, tricep extensions, and leg curls.</p>
        
        <h2>When to Use Compound Exercises</h2>
        <p>Compound exercises should form the foundation of your program. They're more efficient, burn more calories, and build functional strength.</p>
        
        <h2>When to Use Isolation Exercises</h2>
        <p>Isolation exercises are great for targeting specific weaknesses, bringing up lagging body parts, or finishing off a muscle group after compounds.</p>
        
        <h2>Best Approach</h2>
        <p>Use compound exercises for the majority of your training, then add isolation work to address specific needs or aesthetics.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200',
      publishedAt: new Date('2024-03-18'),
      views: 9876,
      authorId: author1._id,
      categoryId: createdCategories[3]._id,
      tagIds: [createdTags[0]._id, createdTags[6]._id],
    },
    {
      title: 'Squat Form: Master the Foundation Movement',
      slug: 'squat-form-master-foundation',
      excerpt:
        'The squat is a fundamental movement pattern. Learn proper squat form, common mistakes, and how to progress safely from bodyweight to weighted squats.',
      content: `
        <h2>Why Squats?</h2>
        <p>Squats build leg strength, improve mobility, and enhance athletic performance. They're one of the most functional exercises you can do.</p>
        
        <h2>Proper Squat Form</h2>
        <ul>
          <li>Feet shoulder-width apart, toes slightly turned out</li>
          <li>Keep chest up and core engaged</li>
          <li>Lower until thighs are parallel to floor (or lower)</li>
          <li>Drive through heels to stand back up</li>
          <li>Keep knees tracking over toes</li>
        </ul>
        
        <h2>Common Mistakes</h2>
        <p>Avoid letting your knees cave in, leaning too far forward, or not going deep enough. Start with bodyweight squats to master form.</p>
        
        <h2>Progressions</h2>
        <p>Start with bodyweight, then progress to goblet squats, front squats, and finally back squats with a barbell.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200',
      publishedAt: new Date('2024-03-20'),
      views: 13456,
      authorId: author1._id,
      categoryId: createdCategories[3]._id,
      tagIds: [createdTags[0]._id, createdTags[3]._id, createdTags[6]._id],
    },
    {
      title: 'Post-Workout Nutrition: Maximize Recovery',
      slug: 'post-workout-nutrition-maximize-recovery',
      excerpt:
        'What you eat after your workout can significantly impact recovery and muscle growth. Learn the optimal post-workout nutrition strategy.',
      content: `
        <h2>The Anabolic Window</h2>
        <p>While the "anabolic window" isn't as narrow as once thought, consuming protein and carbs within 2 hours post-workout can optimize recovery.</p>
        
        <h2>Protein for Recovery</h2>
        <p>Aim for 20-40g of protein post-workout to maximize muscle protein synthesis. This can come from whole foods or supplements.</p>
        
        <h2>Carbohydrates for Glycogen</h2>
        <p>Carbs help replenish muscle glycogen stores. Consume 0.5-0.7g per pound of bodyweight if you're doing multiple sessions per day.</p>
        
        <h2>Post-Workout Meal Ideas</h2>
        <ul>
          <li>Chicken and rice</li>
          <li>Greek yogurt with fruit</li>
          <li>Protein shake with banana</li>
          <li>Eggs on toast</li>
        </ul>
        
        <h2>Hydration</h2>
        <p>Don't forget to rehydrate! Drink water or electrolyte beverages, especially after intense or long workouts.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200',
      publishedAt: new Date('2024-03-22'),
      views: 11234,
      authorId: author2._id,
      categoryId: createdCategories[2]._id,
      tagIds: [createdTags[0]._id, createdTags[4]._id, createdTags[8]._id],
    },
    {
      title: 'Beginner Workout Plan: Your First 4 Weeks',
      slug: 'beginner-workout-plan-first-4-weeks',
      excerpt:
        'Starting your fitness journey? This beginner-friendly workout plan will help you build strength, confidence, and healthy habits in your first month.',
      content: `
        <h2>Week 1-2: Foundation</h2>
        <p>Focus on learning proper form with bodyweight exercises and light weights. Train 3 times per week with rest days between.</p>
        
        <h2>Week 3-4: Progression</h2>
        <p>Increase intensity slightly and add more exercises. Continue training 3 times per week, but increase volume.</p>
        
        <h2>Sample Workout</h2>
        <ul>
          <li>Warm-up: 5 minutes light cardio</li>
          <li>Squats: 3 sets of 10</li>
          <li>Push-ups: 3 sets of 8-12</li>
          <li>Plank: 3 sets of 30 seconds</li>
          <li>Lunges: 3 sets of 10 per leg</li>
          <li>Cool-down: 5 minutes stretching</li>
        </ul>
        
        <h2>Key Principles</h2>
        <p>Focus on form over weight, progress gradually, and listen to your body. Consistency is more important than intensity at this stage.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f0b1?w=1200',
      publishedAt: new Date('2024-03-25'),
      views: 17890,
      authorId: author1._id,
      categoryId: createdCategories[5]._id,
      tagIds: [createdTags[0]._id, createdTags[2]._id],
    },
    {
      title: 'Omega-3 Supplements: Benefits and Dosage',
      slug: 'omega-3-supplements-benefits-dosage',
      excerpt:
        'Omega-3 fatty acids are essential for health. Learn about the benefits of omega-3 supplements, optimal dosages, and when they might be beneficial.',
      content: `
        <h2>What are Omega-3s?</h2>
        <p>Omega-3 fatty acids are essential fats your body can't produce. The most important types are EPA and DHA, found primarily in fish.</p>
        
        <h2>Health Benefits</h2>
        <ul>
          <li>Supports heart health</li>
          <li>Reduces inflammation</li>
          <li>Supports brain function</li>
          <li>May improve joint health</li>
          <li>Supports eye health</li>
        </ul>
        
        <h2>Recommended Dosage</h2>
        <p>Most organizations recommend 250-500mg of combined EPA and DHA daily for general health. Higher doses (1-2g) may be beneficial for specific conditions.</p>
        
        <h2>Food Sources</h2>
        <p>Fatty fish like salmon, mackerel, and sardines are excellent sources. If you don't eat fish regularly, supplements can help meet your needs.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200',
      publishedAt: new Date('2024-03-28'),
      views: 8567,
      authorId: author2._id,
      categoryId: createdCategories[4]._id,
      tagIds: [createdTags[0]._id],
    },
    {
      title: 'Calorie Deficit Calculator: How Much Should You Eat?',
      slug: 'calorie-deficit-calculator-how-much-eat',
      excerpt:
        'Creating the right calorie deficit is crucial for sustainable fat loss. Learn how to calculate your needs and create a deficit that preserves muscle mass.',
      content: `
        <h2>What is a Calorie Deficit?</h2>
        <p>A calorie deficit means consuming fewer calories than you burn. This is necessary for fat loss, but the size of the deficit matters.</p>
        
        <h2>Calculating Your Maintenance Calories</h2>
        <p>Start by estimating your Total Daily Energy Expenditure (TDEE). This includes your Basal Metabolic Rate (BMR) plus activity level.</p>
        
        <h2>Creating a Deficit</h2>
        <p>A moderate deficit of 300-500 calories per day is sustainable and preserves muscle mass. Avoid deficits larger than 1000 calories.</p>
        
        <h2>Factors to Consider</h2>
        <ul>
          <li>Activity level</li>
          <li>Body composition goals</li>
          <li>Metabolic health</li>
          <li>Training intensity</li>
        </ul>
        
        <h2>Adjusting Over Time</h2>
        <p>As you lose weight, your maintenance calories decrease. Periodically recalculate and adjust your intake to continue progress.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200',
      publishedAt: new Date('2024-04-01'),
      views: 20345,
      authorId: author2._id,
      categoryId: createdCategories[1]._id,
      tagIds: [createdTags[0]._id, createdTags[8]._id],
    },
    {
      title: 'Upper Lower Split: Train More Frequently',
      slug: 'upper-lower-split-train-more-frequently',
      excerpt:
        'The upper/lower split allows you to train each muscle group twice per week. Learn how to structure this effective training split.',
      content: `
        <h2>What is Upper/Lower Split?</h2>
        <p>This split divides training into upper body days and lower body days, allowing you to train 4 times per week.</p>
        
        <h2>Benefits</h2>
        <ul>
          <li>Allows 2x per week frequency for each muscle group</li>
          <li>Great for intermediate lifters</li>
          <li>Balanced training volume</li>
          <li>Flexible scheduling</li>
        </ul>
        
        <h2>Sample Schedule</h2>
        <p>Monday: Upper, Tuesday: Lower, Wednesday: Rest, Thursday: Upper, Friday: Lower, Weekend: Rest</p>
        
        <h2>Exercise Selection</h2>
        <p>Upper days: Push and pull movements for chest, back, shoulders, arms. Lower days: Squats, deadlifts, leg exercises, and calves.</p>
        
        <h2>Volume Guidelines</h2>
        <p>Aim for 10-20 sets per muscle group per week, split across your two weekly sessions.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f0b1?w=1200',
      publishedAt: new Date('2024-04-03'),
      views: 14567,
      authorId: author1._id,
      categoryId: createdCategories[5]._id,
      tagIds: [createdTags[0]._id, createdTags[3]._id, createdTags[7]._id],
    },
    {
      title: 'Rest Days: Why Recovery is Essential',
      slug: 'rest-days-why-recovery-essential',
      excerpt:
        'Rest days are not lazy days - they are essential for muscle growth and performance. Learn why recovery matters and how to optimize your rest days.',
      content: `
        <h2>Why Rest Days Matter</h2>
        <p>Muscles grow during rest, not during training. Recovery allows your body to repair muscle tissue and adapt to training stress.</p>
        
        <h2>What Happens During Rest</h2>
        <ul>
          <li>Muscle protein synthesis occurs</li>
          <li>Glycogen stores replenish</li>
          <li>Hormones normalize</li>
          <li>Central nervous system recovers</li>
        </ul>
        
        <h2>How Many Rest Days?</h2>
        <p>Most people need 2-3 rest days per week. Beginners may need more, while advanced lifters might need fewer.</p>
        
        <h2>Active Recovery</h2>
        <p>Light activities like walking, stretching, or yoga can aid recovery without interfering with muscle repair.</p>
        
        <h2>Signs You Need More Rest</h2>
        <p>Persistent fatigue, decreased performance, poor sleep, or increased injury risk are signs you may need more recovery time.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200',
      publishedAt: new Date('2024-04-05'),
      views: 9876,
      authorId: author1._id,
      categoryId: createdCategories[3]._id,
      tagIds: [createdTags[0]._id, createdTags[9]._id],
    },
    {
      title: 'Vegetarian Protein Sources for Muscle Building',
      slug: 'vegetarian-protein-sources-muscle-building',
      excerpt:
        'Building muscle on a vegetarian diet is absolutely possible. Discover the best plant-based protein sources and how to meet your protein needs.',
      content: `
        <h2>Can You Build Muscle on a Vegetarian Diet?</h2>
        <p>Yes! With proper planning, vegetarians can easily meet protein needs and build muscle effectively.</p>
        
        <h2>Best Vegetarian Protein Sources</h2>
        <ul>
          <li>Legumes: Lentils, chickpeas, black beans</li>
          <li>Dairy: Greek yogurt, cottage cheese, milk</li>
          <li>Eggs: Complete protein source</li>
          <li>Quinoa: Complete plant protein</li>
          <li>Nuts and seeds: Almonds, pumpkin seeds</li>
          <li>Tofu and tempeh: Soy-based proteins</li>
        </ul>
        
        <h2>Protein Combining</h2>
        <p>While not necessary at every meal, combining different plant proteins throughout the day ensures you get all essential amino acids.</p>
        
        <h2>Meeting Your Goals</h2>
        <p>Aim for the same protein targets as omnivores: 0.7-1g per pound of bodyweight. Track your intake to ensure you're meeting goals.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200',
      publishedAt: new Date('2024-04-08'),
      views: 11234,
      authorId: author2._id,
      categoryId: createdCategories[2]._id,
      tagIds: [createdTags[0]._id, createdTags[4]._id, createdTags[8]._id],
    },
    {
      title: 'Pre-Workout Supplements: What Actually Works?',
      slug: 'pre-workout-supplements-what-works',
      excerpt:
        'The pre-workout supplement market is flooded with products. Cut through the marketing and learn which ingredients actually enhance performance.',
      content: `
        <h2>Key Ingredients That Work</h2>
        <ul>
          <li>Caffeine: Proven to enhance performance and focus</li>
          <li>Creatine: Increases strength and power</li>
          <li>Beta-Alanine: Reduces fatigue in high-intensity exercise</li>
          <li>Citrulline Malate: May improve endurance</li>
        </ul>
        
        <h2>Ingredients to Avoid</h2>
        <p>Many pre-workouts contain proprietary blends with unproven ingredients. Look for products with transparent labeling and research-backed ingredients.</p>
        
        <h2>Do You Need Pre-Workout?</h2>
        <p>If you're getting adequate sleep and nutrition, you may not need pre-workout. However, it can help with energy and focus if used strategically.</p>
        
        <h2>Natural Alternatives</h2>
        <p>Black coffee, green tea, or a small carbohydrate snack can provide similar benefits without the added cost of supplements.</p>
        
        <h2>Timing</h2>
        <p>Take pre-workout 30-60 minutes before training. Avoid taking it too late in the day as caffeine can interfere with sleep.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200',
      publishedAt: new Date('2024-04-10'),
      views: 14567,
      authorId: author1._id,
      categoryId: createdCategories[4]._id,
      tagIds: [createdTags[0]._id, createdTags[4]._id],
    },
    {
      title: 'Metabolic Damage: Myth or Reality?',
      slug: 'metabolic-damage-myth-or-reality',
      excerpt:
        'The concept of "metabolic damage" from dieting is widely discussed. Learn what the science says about metabolism, dieting, and long-term health.',
      content: `
        <h2>What is Metabolic Adaptation?</h2>
        <p>Your metabolism adapts to calorie restriction by reducing energy expenditure. This is normal and expected, not "damage."</p>
        
        <h2>Does Metabolism Slow Down?</h2>
        <p>Yes, but this is reversible. As you lose weight, your body needs fewer calories. This is a natural adaptation, not permanent damage.</p>
        
        <h2>Factors Affecting Metabolism</h2>
        <ul>
          <li>Body weight and composition</li>
          <li>Muscle mass</li>
          <li>Activity level</li>
          <li>Hormones</li>
          <li>Age</li>
        </ul>
        
        <h2>Preserving Metabolism</h2>
        <p>Maintain muscle mass through resistance training, avoid extreme deficits, and take diet breaks. These strategies help preserve metabolic rate.</p>
        
        <h2>The Bottom Line</h2>
        <p>While metabolism adapts to dieting, true "metabolic damage" is rare. Most people can recover fully with proper nutrition and training.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200',
      publishedAt: new Date('2024-04-12'),
      views: 13234,
      authorId: author2._id,
      categoryId: createdCategories[1]._id,
      tagIds: [createdTags[0]._id, createdTags[8]._id],
    },
    {
      title: 'Volume vs Intensity: Finding the Sweet Spot',
      slug: 'volume-vs-intensity-finding-sweet-spot',
      excerpt:
        'Training volume and intensity are two key variables in program design. Learn how to balance them for optimal muscle growth and strength gains.',
      content: `
        <h2>What is Training Volume?</h2>
        <p>Volume = sets × reps × weight. It's the total amount of work you do. Higher volume generally means more muscle growth potential.</p>
        
        <h2>What is Intensity?</h2>
        <p>Intensity refers to how heavy the weight is relative to your max. Higher intensity (85%+ of 1RM) builds strength, while moderate intensity (60-80%) builds size.</p>
        
        <h2>The Volume-Intensity Relationship</h2>
        <p>As intensity increases, you can typically do less volume. As volume increases, intensity typically decreases. Finding the right balance is key.</p>
        
        <h2>For Muscle Building</h2>
        <p>Moderate intensity (60-80% 1RM) with higher volume (10-20 sets per muscle group per week) is optimal for hypertrophy.</p>
        
        <h2>For Strength</h2>
        <p>Higher intensity (85%+ 1RM) with lower volume (3-6 sets per exercise) is better for maximal strength development.</p>
        
        <h2>Periodization</h2>
        <p>Most effective programs cycle between phases emphasizing volume and intensity to maximize both size and strength gains.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200',
      publishedAt: new Date('2024-04-15'),
      views: 11234,
      authorId: author1._id,
      categoryId: createdCategories[3]._id,
      tagIds: [createdTags[1]._id, createdTags[6]._id, createdTags[7]._id],
    },
    {
      title: 'Meal Timing: Does It Really Matter?',
      slug: 'meal-timing-does-it-really-matter',
      excerpt:
        'Meal timing is often overcomplicated. Learn what actually matters for muscle growth and fat loss, and what you can safely ignore.',
      content: `
        <h2>The Big Picture</h2>
        <p>Total daily calories and protein matter far more than meal timing for most people. Don't stress about perfect timing if your overall nutrition is on point.</p>
        
        <h2>When Timing Matters</h2>
        <p>Meal timing can be important for competitive athletes, those training multiple times per day, or people with specific metabolic conditions.</p>
        
        <h2>Pre-Workout Nutrition</h2>
        <p>Eating 1-3 hours before training provides energy. However, training fasted can also work if you adapt to it.</p>
        
        <h2>Post-Workout Nutrition</h2>
        <p>The "anabolic window" is wider than once thought (2-4 hours), but consuming protein post-workout can optimize recovery.</p>
        
        <h2>Meal Frequency</h2>
        <p>Whether you eat 3 meals or 6 meals per day doesn't significantly impact metabolism or fat loss. Choose what fits your lifestyle.</p>
        
        <h2>Bottom Line</h2>
        <p>Focus on total daily intake first. Meal timing is optimization, not a requirement for success.</p>
      `,
      heroImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200',
      publishedAt: new Date('2024-04-18'),
      views: 9876,
      authorId: author2._id,
      categoryId: createdCategories[2]._id,
      tagIds: [createdTags[0]._id, createdTags[8]._id],
    },
  ]

  for (const articleData of articlesData) {
    const article = await Article.create(articleData)
    console.log(`Created article: ${article.title}`)
  }

  console.log('Seed completed successfully!')
}

import Comment from '@/models/Comment'

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    const mongoose = await import('mongoose')
    await mongoose.default.connection.close()
  })

