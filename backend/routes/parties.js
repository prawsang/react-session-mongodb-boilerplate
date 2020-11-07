const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const Party = require("../models/Party");
const { errorResponse } = require("../utils/error");

// Get all parties
router.get("/", async (req, res) => {
  try {
    const parties = await Party.find();
    res.json(parties);
  } catch (err) {
    res.status(500).json({ errors: err });
  }
});

// Get one party
router.get("/:id", async (req, res) => {
  Party.findOne()
    .populate("users")
    .exec(function (err, party) {
      if (err) return res.status(500).json(errorResponse(err));
      return res.json(party);
    });
});

// Add a party
router.post(
  "/",
  [body("name").notEmpty(), body("noPeople").isInt()],
  async (req, res) => {
    const party = new Party({
      name: req.body.name,
      noPeople: req.body.noPeople,
    });

    try {
      const newParty = await party.save();
      res.status(201).json(newParty);
    } catch (err) {
      res.status(400).json({ errors: err });
    }
  }
);

// Join a Party
router.put("/join", [body("partyId").notEmpty()], async (req, res) => {
  const currentUserId = req.session.user;
  if (!currentUserId) {
    return res
      .status(401)
      .send(errorResponse({ message: "Authentication is required." }));
  }

  // is the party full?
  const selectedParty = await Party.findById(req.body.partyId);
  if (!selectedParty)
    return res
      .status(400)
      .send(errorResponse({ message: "Party does not exist." }));
  if (selectedParty.noPeople <= selectedParty.users.length) {
    return res
      .status(400)
      .json(errorResponse({ message: "This party is full." }));
  }

  Party.updateOne(
    {
      _id: req.body.partyId,
    },
    {
      $addToSet: {
        users: currentUserId,
      },
    }
  )
    .then((updatedParty) => {
      res.json(updatedParty);
    })
    .catch((err) => {
      res.status(400).json(errorResponse(err));
    });
});

module.exports = router;
