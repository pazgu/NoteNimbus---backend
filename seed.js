// seed.js
// This script seeds the database with sample data.
// This is for development purposes only and won't not be used in production.

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const bcrypt = require("bcrypt");

const Note = require("./models/note.model");
const User = require("./models/user.model");

const SALT_ROUNDS = 10; // Number of rounds to generate salt. 10 is recommended value

dotenv.config(); // Load environment variables

const users = [
  {
    username: "john_doe",
    email: "john@example.com",
    password: "password123",
    firstName: "John",
    lastName: "Doe",
  },
  {
    username: "jane_doe",
    email: "jane@example.com",
    password: "password456",
    firstName: "Jane",
    lastName: "Doe",
  },
];

const notes = [
  {
    title: "Complete Project Proposal",
    description: "Finalize and submit the project proposal document.",
    body: "Ensure all sections are complete, review feedback, and submit.",
    todoList: [
      { title: "Write executive summary", isComplete: false },
      { title: "Compile budget estimates", isComplete: true },
      { title: "Review with team", isComplete: false },
      { title: "Submit proposal", isComplete: false },
    ],
    isPinned: true,
  },
  {
    title: "Prepare for Presentation",
    description: "Prepare slides and practice for the client presentation.",
    body: "Create slides, practice speech, and get feedback from colleagues.",
    todoList: [
      { title: "Draft slides", isComplete: true },
      { title: "Add graphics", isComplete: false },
      { title: "Practice speech", isComplete: false },
      { title: "Incorporate feedback", isComplete: false },
    ],
    isPinned: false,
  },
  {
    title: "Develop Marketing Strategy",
    description: "Outline the marketing strategy for the upcoming quarter.",
    body: "Include social media, email campaigns, and events.",
    todoList: [
      { title: "Research market trends", isComplete: false },
      { title: "Identify target audience", isComplete: true },
      { title: "Plan social media posts", isComplete: false },
      { title: "Schedule email campaigns", isComplete: false },
    ],
    isPinned: true,
  },
  {
    title: "Team Meeting Preparation",
    description:
      "Prepare the agenda and materials for the weekly team meeting.",
    body: "Gather reports, outline discussion points, and distribute materials.",
    todoList: [
      { title: "Draft agenda", isComplete: false },
      { title: "Collect weekly reports", isComplete: true },
      { title: "Send out meeting invite", isComplete: false },
      { title: "Prepare discussion points", isComplete: false },
    ],
    isPinned: false,
  },
  {
    title: "Code Review",
    description: "Review code submissions from the development team.",
    body: "Check for bugs, ensure best practices, and provide feedback.",
    todoList: [
      { title: "Review pull request #123", isComplete: false },
      { title: "Test new feature X", isComplete: true },
      { title: "Write feedback comments", isComplete: false },
      { title: "Approve changes", isComplete: false },
    ],
    isPinned: true,
  },
  {
    title: "Client Follow-Up",
    description: "Follow up with clients regarding recent inquiries.",
    body: "Respond to emails, update CRM, and schedule follow-up meetings.",
    todoList: [
      { title: "Reply to client A", isComplete: false },
      { title: "Update CRM notes", isComplete: true },
      { title: "Schedule call with client B", isComplete: false },
      { title: "Send follow-up email to client C", isComplete: false },
    ],
    isPinned: false,
  },
  {
    title: "Website Update",
    description: "Update the company website with new content and features.",
    body: "Add new blog posts, update the product page, and fix bugs.",
    todoList: [
      { title: "Publish blog post", isComplete: false },
      { title: "Update product descriptions", isComplete: true },
      { title: "Fix broken links", isComplete: false },
      { title: "Test new features", isComplete: false },
    ],
    isPinned: true,
  },
  {
    title: "Financial Report",
    description: "Compile and analyze the monthly financial report.",
    body: "Gather data, create charts, and write the analysis.",
    todoList: [
      { title: "Collect financial data", isComplete: false },
      { title: "Create charts and graphs", isComplete: true },
      { title: "Write analysis", isComplete: false },
      { title: "Review with finance team", isComplete: false },
    ],
    isPinned: false,
  },
  {
    title: "HR Policy Update",
    description: "Update the company HR policies based on recent changes.",
    body: "Review current policies, propose updates, and communicate changes.",
    todoList: [
      { title: "Review current HR policies", isComplete: false },
      { title: "Draft proposed updates", isComplete: true },
      { title: "Get approval from management", isComplete: false },
      { title: "Communicate changes to employees", isComplete: false },
    ],
    isPinned: true,
  },
  {
    title: "Product Launch",
    description: "Plan and execute the launch of the new product.",
    body: "Coordinate with marketing, sales, and support teams.",
    todoList: [
      { title: "Finalize launch plan", isComplete: false },
      { title: "Create marketing materials", isComplete: true },
      { title: "Train sales team", isComplete: false },
      { title: "Prepare support documentation", isComplete: false },
    ],
    isPinned: false,
  },
  {
    title: "Customer Survey",
    description: "Design and distribute a customer satisfaction survey.",
    body: "Create survey questions, distribute to customers, and analyze results.",
    todoList: [
      { title: "Draft survey questions", isComplete: false },
      { title: "Send survey to customers", isComplete: true },
      { title: "Collect responses", isComplete: false },
      { title: "Analyze survey results", isComplete: false },
    ],
    isPinned: true,
  },
  {
    title: "Inventory Check",
    description: "Conduct a full inventory check and update records.",
    body: "Count inventory, update database, and report discrepancies.",
    todoList: [
      { title: "Count all items", isComplete: false },
      { title: "Update inventory database", isComplete: true },
      { title: "Report discrepancies", isComplete: false },
      { title: "Reorder low stock items", isComplete: false },
    ],
    isPinned: false,
  },
  {
    title: "Social Media Campaign",
    description:
      "Plan and execute a social media campaign for the new product.",
    body: "Create content, schedule posts, and engage with followers.",
    todoList: [
      { title: "Plan content calendar", isComplete: false },
      { title: "Create social media posts", isComplete: true },
      { title: "Schedule posts", isComplete: false },
      { title: "Respond to comments and messages", isComplete: false },
    ],
    isPinned: true,
  },
  {
    title: "Office Renovation",
    description: "Plan and oversee the office renovation project.",
    body: "Coordinate with contractors, manage budget, and ensure timely completion.",
    todoList: [
      { title: "Hire contractors", isComplete: false },
      { title: "Set budget", isComplete: true },
      { title: "Approve renovation plans", isComplete: false },
      { title: "Monitor progress", isComplete: false },
    ],
    isPinned: false,
  },
  {
    title: "Employee Training",
    description: "Organize and conduct training sessions for new employees.",
    body: "Prepare training materials, schedule sessions, and provide feedback.",
    todoList: [
      { title: "Create training materials", isComplete: false },
      { title: "Schedule training sessions", isComplete: true },
      { title: "Conduct training", isComplete: false },
      { title: "Collect feedback", isComplete: false },
    ],
    isPinned: true,
  },
];

async function seedDB() {
  try {
    await connectDB(); // Connect to the database
    await Note.deleteMany({});
    await User.deleteMany({});

    const createdUsers = await Promise.all(
      users.map(async (u) => {
        const hashedPassword = await bcrypt.hash(u.password, SALT_ROUNDS); // Hash password
        const user = new User({ ...u, password: hashedPassword }); // Create new user object
        await user.save(); // Save user to database
        return user; // Return the saved user object
      })
    );

    // Assign to each note a user id
    const notesWithUsers = notes.map((note, index) => {
      return {
        ...note,
        user: createdUsers[index % createdUsers.length]._id,
        //f.e Note 0 -> User 0 (0 % 3 = 0), Note 1 -> User 1 (1 % 3 = 1)
      };
    });

    const createdNotes = await Note.insertMany(notesWithUsers);

    // Update users collection with their notes array
    for (let note of createdNotes) {
      await User.findByIdAndUpdate(
        note.user,
        { $push: { notes: note._id } },
        { new: true, useFindAndModify: false }
      );
    }

    console.log("Database seeded");
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close(); // Close the database connection
  }
}

seedDB();
