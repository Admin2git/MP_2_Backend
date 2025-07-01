const express = require("express");
const app = express("");

app.use(express.json());
const cors = require("cors");
const { initializeDatabase } = require("./db/db.connect");
const SalesAgent = require("./models/SalesAgent");
const lead = require("./models/lead");
const moment = require("moment");
const { default: mongoose } = require("mongoose");
const comment = require("./models/comment");
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

initializeDatabase();

app.get("/", (req, res) => {
  res.json({ message: "this is lead management api" });
});

async function createNewAgent(newAgent) {
  try {
    const agent = new SalesAgent(newAgent);

    const savedNewAgent = await agent.save();
    return savedNewAgent;
  } catch (error) {
    console.error(error);
  }
}

app.post("/agents", async (req, res) => {
  try {
    const newAgent = req.body;

    if (!newAgent.name || typeof newAgent.name !== "string") {
      return res.status(404).json({
        error: "Name is required and must be a string",
      });
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!newAgent.email || !emailRegex.test(newAgent.email)) {
      return res.status(404).json({
        error: "Email is required and must be a valid email format",
      });
    }

    const existEmail = await SalesAgent.find({ email: newAgent.email });

    if (existEmail.length > 0) {
      return res.status(404).json({
        error: `Sales agent with email '${newAgent.email}' already exists.`,
      });
    }

    const savedNewAgent = await createNewAgent(newAgent);

    if (savedNewAgent) {
      res.status(201).json(savedNewAgent);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fatch agents" });
  }
});

async function getAllAgent() {
  try {
    const agent = await SalesAgent.find();
    return agent;
  } catch (error) {
    console.error(error);
  }
}

app.get("/agents", async (req, res) => {
  try {
    const agents = await getAllAgent();
    if (agents != 0) {
      res.status(201).json(agents);
    } else {
      res.status(404).json({ error: "No agents found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fatch agents." });
  }
});

async function deleteAgentById(agentId) {
  try {
    const deletedAgent = await SalesAgent.findByIdAndDelete(agentId);
    return deletedAgent;
  } catch (error) {
    console.error(error);
  }
}

app.delete("/agents/:agentId", async (req, res) => {
  try {
    const deletedAgent = await deleteAgentById(req.params.agentId);
    if (deletedAgent) {
      res.status(200).json(deletedAgent);
    } else {
      res.status(404).json({ error: "No agent delete." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fatch agents." });
  }
});

async function createNewLead(createLead) {
  try {
    const newLead = new lead(createLead);

    const savedNewLead = await newLead.save();
    return savedNewLead;
  } catch (error) {
    console.error("Error saving lead:", error); // Log the full error for debugging
    throw new Error("Error saving lead"); // Throw a more specific error
  }
}

app.post("/leads", async (req, res) => {
  try {
    const createLead = req.body;

    const { name, source, salesAgent, status, timeToClose, priority } =
      createLead;

    if (!name || typeof name !== "string") {
      return res.status(404).json({
        error: "Name is required and must be a string",
      });
    }

    if (
      !source ||
      ![
        "Website",
        "Referral",
        "Cold Call",
        "Advertisement",
        "Email",
        "Other",
      ].includes(source)
    ) {
      return res.status(404).json({
        error: "source is required and must be one of the predefined values ",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(salesAgent)) {
      return res.status(400).json({
        error: `Sales agent ID '${salesAgent}' is not a valid ObjectId.`,
      });
    }

    const salesId = await SalesAgent.findById(salesAgent);

    if (!salesId) {
      return res.status(404).json({
        error: `Sales agent with ID '${salesAgent}' not found.`,
      });
    }

    if (
      !["New", "Contacted", "Qualified", "Proposal Sent", "Closed"].includes(
        status
      )
    ) {
      return res.status(400).json({
        error:
          "status must be one of New, Contacted, Qualified, Proposal Sent, Closed",
      });
    }

    if (timeToClose <= 0 || !Number.isInteger(timeToClose)) {
      return res.status(400).json({
        error: "timeToClose must be a positive integer.",
      });
    }

    if (!["High", "Medium", "Low"].includes(priority)) {
      return res.status(400).json({
        error: "priority must be one of High, Medium, Low.",
      });
    }

    const savedLead = await createNewLead(createLead);
    if (savedLead) {
      res.status(201).json(savedLead);
    }
  } catch (error) {
    console.error("Error saving lead:", error);
    res.status(500).json({ error: "Failed to fatch leads" });
  }
});

async function getAllLeads({ salesAgent, status, source, priority }) {
  try {
    let filterCriteria = {};

    if (salesAgent) {
      filterCriteria.salesAgent = salesAgent;
    }
    if (status) {
      filterCriteria.status = status;
    }
    if (source) {
      filterCriteria.source = source;
    }
    if (priority) {
      filterCriteria.priority = priority;
    }

    console.log(filterCriteria);
    const leads = await lead.find(filterCriteria).populate("salesAgent");

    return leads;
  } catch (error) {
    console.error(error);
  }
}

app.get("/leads", async (req, res) => {
  try {
    const { salesAgent, status, source, priority } = req.query;

    const leads = await getAllLeads({ salesAgent, status, source, priority });
    if (leads.length != 0) {
      res.status(201).json(leads);
    } else {
      res.status(404).json({ error: "No leads found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fatch leads." });
  }
});

async function getLeadById(leadId) {
  try {
    const leadByid = await lead.findById(leadId).populate("salesAgent");
    return leadByid;
  } catch (error) {
    console.error(error);
  }
}

app.get("/leads/:leadId", async (req, res) => {
  try {
    const leadByid = await getLeadById(req.params.leadId);
    if (leadByid) {
      res.status(200).json(leadByid);
    } else {
      res.status(404).json({ error: "No lead found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fatch leads." });
  }
});

async function updateLeadById(leadId, dataToUpdate) {
  try {
    const updatedLead = await lead.findByIdAndUpdate(leadId, dataToUpdate, {
      new: true,
    });
    return updatedLead;
  } catch (error) {
    console.error(error);
  }
}

app.post("/leads/:leadId", async (req, res) => {
  try {
    const updatedLead = await updateLeadById(req.params.leadId, req.body);
    if (updatedLead) {
      res.status(200).json(updatedLead);
    } else {
      res.status(404).json({ error: "No lead found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fatch leads." });
  }
});

async function deleteLeadById(leadId) {
  try {
    const deletedLead = await lead.findByIdAndDelete(leadId);
    return deletedLead;
  } catch (error) {
    console.error(error);
  }
}

app.delete("/leads/:leadId", async (req, res) => {
  try {
    const deletedLead = await deleteLeadById(req.params.leadId);
    if (deletedLead) {
      res.status(200).json(deletedLead);
    } else {
      res.status(404).json({ error: "No lead delete." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fatch leads." });
  }
});

async function createCommentById(leadId, commentTopost) {
  try {
    const commentOnLead = new comment({ ...commentTopost, lead: leadId });
    const saveComment = await commentOnLead.save();
    return saveComment;
  } catch (error) {
    console.error(error);
  }
}

app.post("/leads/:id/comments", async (req, res) => {
  try {
    const commentOnLead = await createCommentById(req.params.id, req.body);
    if (commentOnLead) {
      res.status(200).json(commentOnLead);
    } else {
      res.status(404).json({ error: "No comment create." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fatch comments." });
  }
});

async function commentByLeadId(leadId) {
  try {
    const allComments = await comment
      .find({ lead: leadId })
      .populate("lead")
      .populate("author");
    return allComments;
  } catch (error) {
    console.error(error);
  }
}

app.get("/leads/:id/comments", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: `lead agent ID is not a valid ObjectId.`,
      });
    }

    const allComments = await commentByLeadId(req.params.id);
    if (allComments && allComments.length > 0) {
      res.status(200).json(allComments);
    } else {
      console.error(error);
      res.status(404).json({ error: "No comments found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fatch comments." });
  }
});

const sevenDaysAgo = moment().subtract(7, "days").toDate();

const getLeadsLastWeek = async () => {
  try {
    const closedLeads = await lead.find({
      status: "Closed",
      updatedAt: { $gte: sevenDaysAgo },
    });

    console.log(closedLeads);
    return closedLeads;
  } catch (error) {
    console.error("Error fetching closed leads in the last week:", error);
  }
};

app.get("/report/last-week", async (req, res) => {
  try {
    const closedLeads = await getLeadsLastWeek();
    if (closedLeads) {
      res.status(200).json(closedLeads);
    } else {
      res.status(404).json({ error: "No leads found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fatch leads." });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
