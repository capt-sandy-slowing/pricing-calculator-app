I want to design a pricing calculator for my business. I have an existing spreadsheet model. Your task is to help me refine the scope and specification for a simple calculator (both back end and front end) that can be used to replace the spreadsheet. From that design/specification, we will develop the calculator together. Here is how the calculator works:

The way it works is that it has some values that are input by the user, and some values that are computed. Some values relate to the model, and then other values relate to a specific project that is being costed. I'd like a basic user interface that shows the model values on the left hand side, and the project variables on the right hand side. The code base that performs the calculations should be transparent and well commented in terms of how the variables relate to each other and what they represent. Similarly, the user interface should make good use of user instructions too to avoid confusion. The broad function of the pricing model is to take two inputs - total amount we need to earn to cover salaries, and total amount we need to earn to fund future growth. Then it should also take weeks per year that we want to work, number of team members we have available to work, expected hours of work per week (ie, 35). From there, it should calculate the total number of hours available across a working year, and work out the required hourly rate and day rate required in order for us to generate enough revenue to capture both the basic salary amounts and amount required to grow. The pricing model should also include a number of standardised yes/no fields that capture particular features of the project that could contribute to a percentage uplift or discount, based on value to us from doing the project, or complexity/risk of doing the project or value to the client. The total potential uplift or discount should be a user input (ie, up to 40%) with the discount for each yes/no feature being a proportion of that total available disounct/uplift on a percentage basis. From the perspective of applying that model to the project specifics, the user interface should enable the user to enter tasks, and input the estimated number of days required to complete them. The user should then be able to trigger the yes/no factors that contribute to uplift/discount, with the percentages applied in the pricing model added or substracted automatically from the total sum calculated.

To be clear on the uplift/disclount system, it should work
  as follows. The user can define a maximum uplift percentage. The user can define a maximum discount percentage. The
  user can add boolean features that contribute to the uplift percentage, or to the discount percentage. Each boolean
  feature within the uplift calculation or the discount calculation can be assigned a percentage toward the total
  percentage available for teh uplift, or for the disclount. The specific boolean features should be defined by the user
  for each project as well as the percentage of total contribution to the uplift or to the discount. Here's an example:
  Total discount percentage allowed (20%), comprised of "Development already included in pipeline" (50%, allowing 10%)
  and "Potential exposure to number of users" (30% of the total 20% allowed) and "High profile brand exposure" (20% of
  the allowed 20% total discount). The uplift system would work in the same way, but be calculated separately. So for
  example, a total uplift of 60% may be possible, with factors including things like awkwardness of timezones, legal
  complexity, risk, or other factors with a similar proportional contribution to the overall uplift percentage permitted
  (ie, 60%).

that looks great on the whole. Simple HTML/JavaScript is great, also consider whether a python script and application
  might be appropriate. A few added features with regard to functionality - when the final project calculation outputs
  are produced, they should compare the actual hourly/day rate to teh required hourly/day rate as given by the user. For
  example, the day rate as computed based on user input might be $400 (required to meet annual budget) but with discounts
   applied, the actual day rate might be $300. The user should be advised about the budgeted and actual day rates and
  difference between them for decision-making purposes. Also, when it comes to user input on the factors and
  contributions to uplift and discount, the system should automatically calculate whether the users input percentage
  contributions sum to 100% or not, and if not, then how much there is remaining (or overallocated).
