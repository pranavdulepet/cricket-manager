(() => {
  const {
    SETTINGS,
    DIFFICULTIES,
    SPEEDS,
    FRANCHISES,
    PITCH_TYPES,
    BATTING_TACTICS,
    POWERPLAY_TACTICS,
    DEATH_TACTICS,
    FIELD_SETTINGS,
    MIDDLE_TACTICS,
    CAPTAINCY_TACTICS,
    generatePlayers,
    roundPrice,
  } = window.CricketManagerData;

  // Roster needs for a 16-player IPL squad:
  //   WK × 2  — first choice + backup gloveman
  //   BAT × 5 — top and middle order depth
  //   AR × 3  — all-round balance
  //   pace × 4 / spin × 2 / finishers × 2 — bowling and finishing coverage
  const NEED_DEFINITIONS = [
    {
      id: "keeper",
      label: "Keeper",
      target: 2,
      matches: (player) => player.role === "WK",
    },
    {
      id: "batting",
      label: "Bat Core",
      target: 5,
      matches: (player) => player.role === "BAT" || player.role === "WK",
    },
    {
      id: "allRounders",
      label: "All-Rounders",
      target: 3,
      matches: (player) => player.role === "AR",
    },
    {
      id: "pace",
      label: "Pace",
      target: 4,
      matches: (player) => hasTag(player, "pace") || hasTag(player, "death"),
    },
    {
      id: "spin",
      label: "Spin",
      target: 2,
      matches: (player) => hasTag(player, "spin") || hasTag(player, "mystery"),
    },
    {
      id: "finishers",
      label: "Finisher",
      target: 2,
      matches: (player) => hasTag(player, "finisher"),
    },
  ];

  const refs = {
    setupModal: document.getElementById("setupModal"),
    setupForm: document.getElementById("setupForm"),
    franchiseSelect: document.getElementById("franchiseSelect"),
    difficultySelect: document.getElementById("difficultySelect"),
    speedSelect: document.getElementById("speedSelect"),
    loadAutosaveBtn: document.getElementById("loadAutosaveBtn"),
    newCampaignBtn: document.getElementById("newCampaignBtn"),
    pauseBtn: document.getElementById("pauseBtn"),
    simAuctionBtn: document.getElementById("simAuctionBtn"),
    saveBtn: document.getElementById("saveBtn"),
    exportBtn: document.getElementById("exportBtn"),
    importInput: document.getElementById("importInput"),
    auctionPhase: document.getElementById("auctionPhase"),
    lotIndicator: document.getElementById("lotIndicator"),
    marketPulse: document.getElementById("marketPulse"),
    saveStatus: document.getElementById("saveStatus"),
    seasonStatus: document.getElementById("seasonStatus"),
    playerName: document.getElementById("playerName"),
    playerRoleBadge: document.getElementById("playerRoleBadge"),
    playerNationBadge: document.getElementById("playerNationBadge"),
    playerMeta: document.getElementById("playerMeta"),
    playerTags: document.getElementById("playerTags"),
    statBars: document.getElementById("statBars"),
    playerPortrait: document.getElementById("playerPortrait"),
    playerCard: document.getElementById("playerCard"),
    currentBidTile: document.getElementById("currentBidTile"),
    currentBid: document.getElementById("currentBid"),
    leadingTeam: document.getElementById("leadingTeam"),
    fairValue: document.getElementById("fairValue"),
    nextIncrement: document.getElementById("nextIncrement"),
    clockText: document.getElementById("clockText"),
    timerFill: document.getElementById("timerFill"),
    bidButton: document.getElementById("bidButton"),
    maxBidInput: document.getElementById("maxBidInput"),
    setProxyBtn: document.getElementById("setProxyBtn"),
    clearProxyBtn: document.getElementById("clearProxyBtn"),
    marketRead: document.getElementById("marketRead"),
    bidAdvice: document.getElementById("bidAdvice"),
    nominationReason: document.getElementById("nominationReason"),
    auctionLog: document.getElementById("auctionLog"),
    rivalBoard: document.getElementById("rivalBoard"),
    scoutRivalBtn: document.getElementById("scoutRivalBtn"),
    userFranchiseName: document.getElementById("userFranchiseName"),
    userStrategy: document.getElementById("userStrategy"),
    userPurse: document.getElementById("userPurse"),
    slotsLeft: document.getElementById("slotsLeft"),
    proxyStatus: document.getElementById("proxyStatus"),
    needsGrid: document.getElementById("needsGrid"),
    userSquad: document.getElementById("userSquad"),
    leaderboard: document.getElementById("leaderboard"),
    undoBidBtn: document.getElementById("undoBidBtn"),
    skipPlayerBtn: document.getElementById("skipPlayerBtn"),
    // Sim progress overlays
    auctionSimOverlay: document.getElementById("auctionSimOverlay"),
    simOverlayPhase: document.getElementById("simOverlayPhase"),
    simOverlayDesc: document.getElementById("simOverlayDesc"),
    simProgressBar: document.getElementById("simProgressBar"),
    simProgressLots: document.getElementById("simProgressLots"),
    simProgressPct: document.getElementById("simProgressPct"),
    simLiveFeed: document.getElementById("simLiveFeed"),
    simStatSold: document.getElementById("simStatSold"),
    simStatUnsold: document.getElementById("simStatUnsold"),
    simStatAvg: document.getElementById("simStatAvg"),
    simStatTop: document.getElementById("simStatTop"),
    cancelSimBtn: document.getElementById("cancelSimBtn"),
    seasonSimOverlay: document.getElementById("seasonSimOverlay"),
    seasonSimLabel: document.getElementById("seasonSimLabel"),
    seasonProgressBar: document.getElementById("seasonProgressBar"),
    seasonProgressText: document.getElementById("seasonProgressText"),
    seasonProgressPct: document.getElementById("seasonProgressPct"),
    seasonSimLastMatch: document.getElementById("seasonSimLastMatch"),
    simNextBtn: document.getElementById("simNextBtn"),
    simRoundBtn: document.getElementById("simRoundBtn"),
    simSeasonBtn: document.getElementById("simSeasonBtn"),
    seasonSummary: document.getElementById("seasonSummary"),
    recentMatches: document.getElementById("recentMatches"),
    pointsTable: document.getElementById("pointsTable"),
    // Tactics modal
    tacticsModal: document.getElementById("tacticsModal"),
    tacticsMatchTitle: document.getElementById("tacticsMatchTitle"),
    tacticsPitchBadge: document.getElementById("tacticsPitchBadge"),
    tacticsPitchDesc: document.getElementById("tacticsPitchDesc"),
    tacticsPitchHint: document.getElementById("tacticsPitchHint"),
    battingTacticOpts: document.getElementById("battingTacticOpts"),
    powerplayTacticOpts: document.getElementById("powerplayTacticOpts"),
    middleTacticOpts: document.getElementById("middleTacticOpts"),
    deathTacticOpts: document.getElementById("deathTacticOpts"),
    fieldTacticOpts: document.getElementById("fieldTacticOpts"),
    captaincyTacticOpts: document.getElementById("captaincyTacticOpts"),
    tacticAdvisor: document.getElementById("tacticAdvisor"),
    tacticsForm: document.getElementById("tacticsForm"),
    autoTacticsBtn: document.getElementById("autoTacticsBtn"),
    // Live match modal
    liveMatchModal: document.getElementById("liveMatchModal"),
    liveMatchPhaseLabel: document.getElementById("liveMatchPhaseLabel"),
    liveMatchTitle: document.getElementById("liveMatchTitle"),
    livePitchBadge: document.getElementById("livePitchBadge"),
    livePitchDesc: document.getElementById("livePitchDesc"),
    inningsBlock1: document.getElementById("inningsBlock1"),
    innings1Label: document.getElementById("innings1Label"),
    phaseBars1: document.getElementById("phaseBars1"),
    innings1Total: document.getElementById("innings1Total"),
    innings1Best: document.getElementById("innings1Best"),
    inningsBlock2: document.getElementById("inningsBlock2"),
    innings2Label: document.getElementById("innings2Label"),
    phaseBars2: document.getElementById("phaseBars2"),
    innings2Total: document.getElementById("innings2Total"),
    innings2Best: document.getElementById("innings2Best"),
    liveResultBlock: document.getElementById("liveResultBlock"),
    liveResultText: document.getElementById("liveResultText"),
    livePomText: document.getElementById("livePomText"),
    tacticFeedback: document.getElementById("tacticFeedback"),
    liveCommentary: document.getElementById("liveCommentary"),
    closeLiveMatchBtn: document.getElementById("closeLiveMatchBtn"),
    // Season awards
    seasonAwardsModal: document.getElementById("seasonAwardsModal"),
    seasonAwardsContent: document.getElementById("seasonAwardsContent"),
    // Stats database
    statsSection: document.getElementById("statsSection"),
    statsSearch: document.getElementById("statsSearch"),
    statsTeamFilter: document.getElementById("statsTeamFilter"),
    statsRoleFilter: document.getElementById("statsRoleFilter"),
    statsTableWrap: document.getElementById("statsTableWrap"),
    statsBattingTab: document.getElementById("statsBattingTab"),
    statsBowlingTab: document.getElementById("statsBowlingTab"),
    // Scenario mode
    scenarioOpponent: document.getElementById("scenarioOpponent"),
    scenarioPitch: document.getElementById("scenarioPitch"),
    scenarioRunsNeeded: document.getElementById("scenarioRunsNeeded"),
    scenarioOversLeft: document.getElementById("scenarioOversLeft"),
    scenarioWktsInHand: document.getElementById("scenarioWktsInHand"),
    runScenarioBtn: document.getElementById("runScenarioBtn"),
    scenarioOutput: document.getElementById("scenarioOutput"),
  };

  let state = null;
  let tickHandle = null;
  let lastFrameAt = performance.now();
  // Stores a snapshot of the lot before the last manual user bid, enabling undo.
  let undoBidSnapshot = null;
  // Pre-match tactics chosen by user for the upcoming fixture
  let pendingTactics = null;
  // Callback to fire once live match modal is closed
  let liveMatchCallback = null;

  // Commentary pools by phase and event
  const COMMENTARY = {
    powerplayGood:  ["Flying start from the openers!", "Early boundaries setting the tone.", "Powerplay dominated — scoreboard ticking."],
    powerplayBad:   ["Wickets in the powerplay hurt badly.", "Tough opening phase — rebuilding needed.", "Lost too much early, now it's a mountain."],
    middleGood:     ["Middle overs milked well. Platform set.", "Smart accumulation through the middle.", "Rotated strike beautifully, no momentum lost."],
    middleBad:      ["Middle-over wobble — wickets leaked.", "Pressure building as dot balls mount.", "Spinners tied them down in the middle."],
    deathGood:      ["Carnage in the death overs!", "Explosive hitting at the end.", "Death overs plundered — massive total."],
    deathBad:       ["Strangled in the death overs.", "Specialist bowling sealed it late.", "Couldn't find the boundary when it mattered most."],
    chaseTight:     ["Nervy chase — this is going right to the wire!", "Required rate climbing with every over.", "Heart-in-mouth cricket."],
    chaseComfort:   ["Comfortable chase, clinical finish.", "Chased down with overs to spare.", "Barely broke a sweat."],
    tacticsWin:     ["Your tactical read of the surface was spot on.", "The pre-match plan worked perfectly.", "Conditions matched your blueprint exactly."],
    tacticsMiss:    ["The pitch didn't cooperate with the plan.", "Conditions caught you off guard.", "Wrong read — the surface punished the approach."],
  };

  function initialize() {
    populateSetupControls();
    bindEvents();

    const autosave = readLocalSave();
    refs.loadAutosaveBtn.disabled = !autosave;

    if (autosave) {
      try {
        hydrateState(autosave);
        hideSetup();
      } catch (error) {
        console.error(error);
        localStorage.removeItem(SETTINGS.storageKey);
        refs.loadAutosaveBtn.disabled = true;
        showSetup();
      }
    } else {
      showSetup();
    }

    initStatsListeners();
    render();
    startTicker();
  }

  function populateSetupControls() {
    refs.franchiseSelect.innerHTML = FRANCHISES.map(
      (team) => `<option value="${team.id}">${team.name} - ${team.strategyLabel}</option>`
    ).join("");

    refs.difficultySelect.innerHTML = Object.values(DIFFICULTIES)
      .map(
        (difficulty) =>
          `<option value="${difficulty.id}">${difficulty.label} - ${difficulty.description}</option>`
      )
      .join("");

    refs.speedSelect.innerHTML = Object.values(SPEEDS)
      .map((speed) => `<option value="${speed.id}">${speed.label}</option>`)
      .join("");

    refs.franchiseSelect.value = FRANCHISES[0].id;
    refs.difficultySelect.value = "warRoom";
    refs.speedSelect.value = "broadcast";
  }

  function bindEvents() {
    refs.setupForm.addEventListener("submit", (event) => {
      event.preventDefault();
      createCampaign({
        franchiseId: refs.franchiseSelect.value,
        difficultyId: refs.difficultySelect.value,
        speedId: refs.speedSelect.value,
      });
    });

    refs.loadAutosaveBtn.addEventListener("click", () => {
      const autosave = readLocalSave();
      if (!autosave) {
        return;
      }
      hydrateState(autosave);
      hideSetup();
      addLog("Autosave restored from local storage.", "positive");
      render();
      persistState();
    });

    refs.newCampaignBtn.addEventListener("click", () => {
      showSetup();
    });

    refs.pauseBtn.addEventListener("click", () => {
      if (!state || state.auction.status === "complete") {
        return;
      }

      state.auction.status =
        state.auction.status === "paused" ? "running" : "paused";
      addLog(
        state.auction.status === "paused" ? "Auction paused." : "Auction resumed.",
        state.auction.status === "paused" ? "warning" : "positive"
      );
      render();
      persistState();
    });

    refs.simAuctionBtn.addEventListener("click", () => {
      if (!state) {
        return;
      }
      simulateRemainingAuction();
    });

    refs.saveBtn.addEventListener("click", () => {
      if (!state) {
        return;
      }
      persistState();
      render();
    });

    refs.exportBtn.addEventListener("click", () => {
      if (!state) {
        return;
      }

      const payload = JSON.stringify(state, null, 2);
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `cricket-manager-save-${Date.now()}.json`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 500);

      addLog("Campaign exported to a local JSON file.", "positive");
      render();
      persistState();
    });

    refs.importInput.addEventListener("change", (event) => {
      const [file] = event.target.files || [];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        try {
          hydrateState(JSON.parse(String(reader.result)));
          hideSetup();
          addLog("Imported local save file.", "positive");
          render();
          persistState();
        } catch (error) {
          console.error(error);
          addLog("Import failed. The file is not a valid current save.", "danger");
          render();
        } finally {
          refs.importInput.value = "";
        }
      };

      reader.readAsText(file);
    });

    refs.bidButton.addEventListener("click", () => {
      const userTeam = getUserTeam();
      if (!userTeam || !state?.auction.currentLot) {
        return;
      }
      placeBid(userTeam.id);
    });

    refs.setProxyBtn.addEventListener("click", () => {
      if (!state?.auction.currentLot) {
        return;
      }

      const numericValue = Number(refs.maxBidInput.value);
      if (!Number.isFinite(numericValue) || numericValue < SETTINGS.minimumBid) {
        return;
      }

      state.auction.proxy = {
        playerId: state.auction.currentLot.playerId,
        maxBid: roundPrice(numericValue),
      };
      addLog(
        `Proxy bid armed up to ${formatCrore(state.auction.proxy.maxBid)} for ${getCurrentPlayer().name}.`,
        "positive"
      );
      render();
      persistState();
    });

    refs.clearProxyBtn.addEventListener("click", () => {
      if (!state) {
        return;
      }
      state.auction.proxy = null;
      addLog("Proxy bid cleared.", "warning");
      render();
      persistState();
    });

    refs.undoBidBtn.addEventListener("click", () => {
      undoBid();
    });

    refs.simNextBtn.addEventListener("click", () => {
      if (!state) return;
      simulateNextMatchWithTactics();
    });

    refs.simRoundBtn.addEventListener("click", () => {
      if (!state) return;
      simulateNextRound();
    });

    refs.simSeasonBtn.addEventListener("click", () => {
      if (!state) return;
      simulateSeason();
    });

    refs.scoutRivalBtn?.addEventListener("click", () => {
      triggerRivalScout();
    });

    refs.runScenarioBtn?.addEventListener("click", () => {
      runScenarioMode();
    });

    refs.closeLiveMatchBtn.addEventListener("click", () => {
      hideLiveMatchModal();
    });

    refs.skipPlayerBtn.addEventListener("click", () => {
      skipCurrentLot();
    });

    refs.cancelSimBtn.addEventListener("click", () => {
      cancelAuctionSim();
    });

    window.addEventListener("keydown", (event) => {
      const target = event.target;
      const inField =
        target instanceof HTMLInputElement || target instanceof HTMLSelectElement;
      if (inField) {
        return;
      }
      if (event.key.toLowerCase() === "b") {
        event.preventDefault();
        refs.bidButton.click();
      }
      // P — focus proxy cap input so the player can type a max bid quickly
      if (event.key.toLowerCase() === "p") {
        event.preventDefault();
        refs.maxBidInput.focus();
        refs.maxBidInput.select();
      }
      // U — undo the last manual bid
      if (event.key.toLowerCase() === "u") {
        event.preventDefault();
        refs.undoBidBtn.click();
      }
      // S — skip current lot (only if no bids placed yet)
      if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        refs.skipPlayerBtn.click();
      }
      // Escape — clear active proxy bid
      if (event.key === "Escape") {
        refs.clearProxyBtn.click();
      }
    });
  }

  function showSetup() {
    refs.setupModal.classList.add("visible");
    refs.setupModal.setAttribute("aria-hidden", "false");
  }

  function hideSetup() {
    refs.setupModal.classList.remove("visible");
    refs.setupModal.setAttribute("aria-hidden", "true");
  }

  function createCampaign({ franchiseId, difficultyId, speedId }) {
    state = {
      version: SETTINGS.version,
      createdAt: Date.now(),
      difficultyId,
      speedId,
      userFranchiseId: franchiseId,
      rngSeed: (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0,
      lastSavedAt: null,
      players: generatePlayers().map((player) => ({
        ...player,
        status: "available",
      })),
      franchises: FRANCHISES.map((franchise) => ({
        ...franchise,
        purse: SETTINGS.initialPurse,
        squad: [],
        contracts: {},
        spent: 0,
      })),
      logs: [],
      seasonNumber: 1,
      seasonHistory: [],
      seasonStats: {}, // { [playerId]: { pomAwards, runs, wickets, matches } }
      auctionIntel: {
        scoutedTeamId: null,
        revealUntilLot: 0,
        scansUsed: 0,
      },
      auction: {
        status: "running",
        lotNumber: 0,
        currentLot: null,
        soldLots: [],
        // IPL-style pre-ordered queue: populated after state is built below
        queue: [],
        queueIndex: 0,
        acceleratedPhase: false, // true once primary queue is exhausted
        proxy: null,
      },
      season: createSeasonState(),
    };

    // Build the IPL-style strategic auction order now that players exist in state
    state.auction.queue = generateAuctionQueue(state.players);

    applyTheme();
    lastFrameAt = performance.now();
    addLog("Real-player auction sandbox created. Every team starts with the same 120 cr purse.", "positive");
    startNextLot();
    hideSetup();
    render();
    persistState();
  }

  function createSeasonState() {
    const table = {};
    FRANCHISES.forEach((franchise) => {
      table[franchise.id] = {
        teamId: franchise.id,
        played: 0,
        won: 0,
        lost: 0,
        points: 0,
        netRuns: 0,
        nrr: 0,
        runsFor: 0,
        runsAgainst: 0,
      };
    });

    return {
      status: "locked",
      fixtures: [],
      currentFixtureIndex: 0,
      table,
      recentMatches: [],
      championId: null,
      playoff: {
        q1Winner: null,
        q1Loser: null,
        elimWinner: null,
        q2Winner: null,
        addedQ2: false,
        addedFinal: false,
      },
    };
  }

  function hydrateState(payload) {
    if (
      !payload ||
      typeof payload !== "object" ||
      payload.version !== SETTINGS.version ||
      !Array.isArray(payload.players) ||
      payload.players.length === 0 ||
      !Array.isArray(payload.franchises) ||
      payload.franchises.length !== FRANCHISES.length ||
      !payload.userFranchiseId ||
      !FRANCHISES.some((f) => f.id === payload.userFranchiseId) ||
      !payload.auction ||
      typeof payload.auction !== "object" ||
      !payload.season ||
      typeof payload.season !== "object"
    ) {
      throw new Error("Invalid save payload.");
    }

    state = {
      ...payload,
      seasonNumber: payload.seasonNumber ?? 1,
      seasonHistory: Array.isArray(payload.seasonHistory) ? payload.seasonHistory : [],
      seasonStats: payload.seasonStats && typeof payload.seasonStats === "object" ? payload.seasonStats : {},
      auctionIntel: payload.auctionIntel && typeof payload.auctionIntel === "object"
        ? {
            scoutedTeamId: payload.auctionIntel.scoutedTeamId || null,
            revealUntilLot: Number(payload.auctionIntel.revealUntilLot) || 0,
            scansUsed: Number(payload.auctionIntel.scansUsed) || 0,
          }
        : { scoutedTeamId: null, revealUntilLot: 0, scansUsed: 0 },
      logs: Array.isArray(payload.logs) ? payload.logs : [],
      auction: {
        ...payload.auction,
        soldLots: Array.isArray(payload.auction.soldLots) ? payload.auction.soldLots : [],
        queue: Array.isArray(payload.auction.queue) ? payload.auction.queue : [],
        queueIndex: typeof payload.auction.queueIndex === "number" ? payload.auction.queueIndex : 0,
        acceleratedPhase: Boolean(payload.auction.acceleratedPhase),
        proxy: payload.auction.proxy || null,
      },
      season: {
        ...payload.season,
        recentMatches: Array.isArray(payload.season.recentMatches)
          ? payload.season.recentMatches
          : [],
        fixtures: Array.isArray(payload.season.fixtures)
          ? payload.season.fixtures
          : [],
        playoff: payload.season.playoff || createSeasonState().playoff,
      },
    };

    state.franchises = state.franchises.map((team) => ({
      ...team,
      contracts: team.contracts && typeof team.contracts === "object" ? team.contracts : {},
    }));
    state.franchises.forEach((team) => {
      team.squad.forEach((playerId) => {
        if (!Number.isFinite(team.contracts[playerId])) {
          team.contracts[playerId] = 1;
        }
      });
    });

    if (state.auction.currentLot) {
      const speed = getSpeed();
      state.auction.currentLot.maxTimer =
        state.auction.currentLot.maxTimer || speed.openingClock;
      state.auction.currentLot.nextAiActionAt =
        performance.now() + randomBetween(0.45, 1.1) * 1000;
      state.auction.currentLot.nextProxyActionAt =
        performance.now() + randomBetween(0.25, 0.75) * 1000;
    }

    // One-time migration: ensure all season stat entries have the full schema
    for (const stats of Object.values(state.seasonStats)) {
      if (stats.runs === undefined) stats.runs = 0;
      if (stats.wickets === undefined) stats.wickets = 0;
      if (stats.matches === undefined) stats.matches = 0;
    }

    applyTheme();
    lastFrameAt = performance.now();
  }

  function readLocalSave() {
    try {
      const raw = localStorage.getItem(SETTINGS.storageKey);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && parsed.version === SETTINGS.version ? parsed : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  function persistState() {
    if (!state) {
      return;
    }

    state.lastSavedAt = Date.now();

    try {
      localStorage.setItem(SETTINGS.storageKey, JSON.stringify(state));
      refs.loadAutosaveBtn.disabled = false;
    } catch (error) {
      console.error(error);
      addLog("Local save failed. Browser storage may be full.", "danger");
    }
  }

  function startTicker() {
    if (tickHandle) {
      clearInterval(tickHandle);
    }

    tickHandle = window.setInterval(() => {
      const now = performance.now();
      const deltaSeconds = (now - lastFrameAt) / 1000;
      lastFrameAt = now;
      tick(deltaSeconds, now);
    }, 180);
  }

  function tick(deltaSeconds, now) {
    if (!state || state.auction.status !== "running" || !state.auction.currentLot) {
      renderClock();
      return;
    }

    state.auction.currentLot.timer = Math.max(
      0,
      state.auction.currentLot.timer - deltaSeconds
    );

    maybeProxyBid(now);
    maybeAiBid(now);

    if (state.auction.currentLot.timer <= 0.02) {
      closeCurrentLot();
    }

    renderClock();
  }

  function nextRandom() {
    state.rngSeed += 0x6d2b79f5;
    let t = state.rngSeed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function randomBetween(min, max) {
    return min + (max - min) * nextRandom();
  }

  function randomNormal(mean = 0, standardDeviation = 1) {
    const u1 = Math.max(nextRandom(), 1e-7);
    const u2 = Math.max(nextRandom(), 1e-7);
    const magnitude = Math.sqrt(-2.0 * Math.log(u1));
    const z0 = magnitude * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * standardDeviation;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getDifficulty() {
    return DIFFICULTIES[state?.difficultyId] || DIFFICULTIES.warRoom;
  }

  function getSpeed() {
    return SPEEDS[state?.speedId] || SPEEDS.broadcast;
  }

  function getPlayerById(playerId) {
    return state.players.find((player) => player.id === playerId) || null;
  }

  function getCurrentLot() {
    return state?.auction.currentLot || null;
  }

  function getCurrentPlayer() {
    return getCurrentLot() ? getPlayerById(getCurrentLot().playerId) : null;
  }

  function getTeamById(teamId) {
    return state.franchises.find((team) => team.id === teamId) || null;
  }

  function getUserTeam() {
    return state?.franchises.find((team) => team.id === state.userFranchiseId) || null;
  }

  function getTeamPlayers(team) {
    return team.squad.map((playerId) => getPlayerById(playerId)).filter(Boolean);
  }

  function getSlotsLeft(team) {
    return Math.max(0, SETTINGS.squadSize - team.squad.length);
  }

  function getOverseasCount(team) {
    return getTeamPlayers(team).filter((player) => player.overseas).length;
  }

  function hasTag(player, tag) {
    return Boolean(player?.tags?.includes(tag));
  }

  function countMatching(team, matcher) {
    return getTeamPlayers(team).filter(matcher).length;
  }

  function getNeedSnapshot(team) {
    const snapshot = {};

    NEED_DEFINITIONS.forEach((need) => {
      const current = countMatching(team, need.matches);
      snapshot[need.id] = {
        label: need.label,
        current,
        target: need.target,
        deficit: Math.max(0, need.target - current),
      };
    });

    snapshot.overseas = {
      current: getOverseasCount(team),
      target: SETTINGS.maxOverseas,
      deficit: 0,
    };

    return snapshot;
  }

  function getBudgetPerSlot(team) {
    return roundPrice(team.purse / Math.max(1, getSlotsLeft(team)));
  }

  function tagOverlapCount(left, right) {
    return left.tags.reduce(
      (count, tag) => count + (right.tags.includes(tag) ? 1 : 0),
      0
    );
  }

  function countLeagueDemand(player) {
    return state.franchises.reduce(
      (sum, team) => sum + (getNeedPressure(team, player) >= 1.35 ? 1 : 0),
      0
    );
  }

  function calculateScarcity(player) {
    const remaining = state.players.filter((candidate) => candidate.status === "available");
    const similar = remaining.filter(
      (candidate) =>
        candidate.id !== player.id &&
        candidate.role === player.role &&
        (tagOverlapCount(candidate, player) >= 1 ||
          candidate.marketValue >= player.marketValue - 1)
    ).length;
    const demand = countLeagueDemand(player);
    return Math.min(3.2, (demand / Math.max(1, similar + 1)) * 3);
  }

  /**
   * Returns a numeric pressure score representing how urgently a team needs
   * this player's role/tags to fill roster gaps.
   *
   * Per-role weights (per deficit unit):
   *   WK keeper deficit   × 1.8  — only one spot; scarcest role
   *   BAT/WK batting      × 0.55 — shared with WK so lower per-unit weight
   *   AR all-rounder      × 1.3  — high versatility premium
   *   pace/death bowler   × 0.7
   *   spin/mystery        × 0.8
   *   finisher            × 1.0
   *   captaincy bonus     + 0.25 for patient teams (patience > 0.65)
   */
  function getNeedPressure(team, player) {
    const needs = getNeedSnapshot(team);
    let pressure = 0;

    if (player.role === "WK") {
      pressure += needs.keeper.deficit * 1.8;
    }
    if (player.role === "BAT" || player.role === "WK") {
      pressure += needs.batting.deficit * 0.55;
    }
    if (player.role === "AR") {
      pressure += needs.allRounders.deficit * 1.3;
    }
    if (hasTag(player, "pace") || hasTag(player, "death")) {
      pressure += needs.pace.deficit * 0.7;
    }
    if (hasTag(player, "spin") || hasTag(player, "mystery")) {
      pressure += needs.spin.deficit * 0.8;
    }
    if (hasTag(player, "finisher")) {
      pressure += needs.finishers.deficit * 1;
    }
    if (hasTag(player, "captain") && team.patience > 0.65) {
      pressure += 0.25;
    }

    return pressure;
  }

  function getStrategyAlignment(team, player) {
    let score = 0;

    team.focusTags.forEach((tag) => {
      if (hasTag(player, tag)) {
        score += 0.34;
      }
    });

    if (!player.overseas) {
      score += team.indianBias * 0.68;
    }
    if (player.age <= 24) {
      score += team.youthBias * 0.9;
    }
    if (hasTag(player, "marquee")) {
      score += team.starBias * 1.28;
    }
    if (player.originTeam === team.short) {
      score += 0.15;
    }

    return score;
  }

  // Thresholds scaled for 16-player squads (was 3/4 for 12-player squads)
  function isSurplusPlayer(team, player) {
    const needs = getNeedSnapshot(team);
    // WK: surplus once both slots filled with 5+ slots still to go
    if (player.role === "WK" && needs.keeper.deficit === 0 && getSlotsLeft(team) <= 5) {
      return true;
    }
    // AR: surplus once 3 slots filled with 6+ slots to go
    if (player.role === "AR" && needs.allRounders.deficit === 0 && getSlotsLeft(team) <= 6) {
      return true;
    }
    // Spin depth: surplus once 2 spinners locked and squad is nearly full
    if (
      (hasTag(player, "spin") || hasTag(player, "mystery")) &&
      needs.spin.deficit === 0 &&
      getSlotsLeft(team) <= 5
    ) {
      return true;
    }
    // Pace depth: surplus once 4 pace slots filled and very few slots remain
    if (
      (hasTag(player, "pace") || hasTag(player, "death")) &&
      needs.pace.deficit === 0 &&
      getSlotsLeft(team) <= 4
    ) {
      return true;
    }
    return false;
  }

  /**
   * Calculates how much a specific team should value a player at auction.
   *
   * Starts from market value, then layers on:
   *   +need pressure × 0.95   — urgency of this role in the team's roster
   *   +scarcity × 0.75        — how few equivalent players remain available
   *   +strategy alignment     — how well the player fits the team's focus tags
   *   +aggression × 0.45      — teams with budget headroom bid up more
   *   −1.6                    — penalty when overseas slots are almost full
   *   −0.95                   — budget squeeze when <2.4 cr per slot left
   *   −0.8                    — surplus role the team doesn't need
   *   ±difficulty modifiers   — aiBoost shifts baseline; aiDiscipline scales market value
   */
  function calculateTeamValuation(team, player) {
    const difficulty = getDifficulty();
    let value = player.marketValue;

    value += getNeedPressure(team, player) * 0.95;
    value += calculateScarcity(player) * 0.75;
    value += getStrategyAlignment(team, player);

    if (getBudgetPerSlot(team) > player.marketValue) {
      value += team.aggression * 0.45;
    }
    if (player.overseas && getOverseasCount(team) >= SETTINGS.maxOverseas - 1) {
      value -= 1.6; // Overseas slot almost full — heavy discount on more overseas players
    }
    if (getBudgetPerSlot(team) < 2.4) {
      value -= 0.95; // Budget squeeze — can't afford to chase at fair value
    }
    if (isSurplusPlayer(team, player)) {
      value -= 0.8; // Already have enough of this role
    }

    // IPL rule pressure: teams below minimum squad size must value every player higher
    const squadShortfall = SETTINGS.minSquadSize - team.squad.length;
    if (squadShortfall > 0) {
      value += squadShortfall * 0.6;
    }

    value += difficulty.aiBoost;
    value += (difficulty.aiDiscipline - 1) * player.marketValue;
    return roundPrice(Math.max(player.basePrice, value));
  }

  function reserveAfterWin(team, bidValue) {
    const slotsAfterWin = Math.max(0, getSlotsLeft(team) - 1);
    // Must be able to fill at least to minSquadSize at minimum bid
    const mandatorySlots = Math.max(0, SETTINGS.minSquadSize - team.squad.length - 1);
    const reserveSlots = Math.max(slotsAfterWin, mandatorySlots);
    return roundPrice(team.purse - bidValue - reserveSlots * SETTINGS.minimumBid);
  }

  // IPL auction bid increments (2024 rules):
  //   < ₹1 cr   → ₹5 lakh  (0.05)
  //   ₹1–2 cr   → ₹10 lakh (0.10)
  //   ₹2–5 cr   → ₹25 lakh (0.25)
  //   ₹5–10 cr  → ₹50 lakh (0.50)
  //   ≥ ₹10 cr  → ₹1 crore (1.00)
  function getIncrement(price) {
    if (price < 1) return 0.05;
    if (price < 2) return 0.10;
    if (price < 5) return 0.25;
    if (price < 10) return 0.50;
    return 1.00;
  }

  function getNextBidValue() {
    const lot = getCurrentLot();
    if (!lot) {
      return SETTINGS.minimumBid;
    }
    if (!lot.leadingBidderId) {
      return lot.currentBid;
    }
    return roundPrice(lot.currentBid + getIncrement(lot.currentBid));
  }

  function canTeamBid(team, player, bidValue) {
    if (!team || !player) {
      return false;
    }
    if (getCurrentLot()?.leadingBidderId === team.id) {
      return false;
    }
    if (getSlotsLeft(team) <= 0) {
      return false;
    }
    if (bidValue > team.purse + 0.0001) {
      return false;
    }
    if (reserveAfterWin(team, bidValue) < -0.0001) {
      return false;
    }
    if (player.overseas && getOverseasCount(team) >= SETTINGS.maxOverseas) {
      return false;
    }
    return true;
  }

  /**
   * Computes how far above fair valuation a team is willing to bid due to
   * emotional/strategic bluffing.
   *
   * Formula:
   *   padding = bluffBias × bluffFactor × (rivalryHeat×0.22 + userNeed×0.22 + starBonus)
   *   + (valuation − marketValue) × 0.12   — amplifies when team already values high
   *   clamped to [0, 2.5]
   *
   *   starBonus = 0.8 for marquee players, 0.25 otherwise
   *   bluffFactor is set per difficulty (0.86 Owner Box → 1.14 Shark Tank)
   */
  function computeBluffPadding(team, player, valuation) {
    const difficulty = getDifficulty();
    const userNeed = getUserTeam() ? getNeedPressure(getUserTeam(), player) : 0;
    const rivalryHeat = countLeagueDemand(player);
    const padding =
      team.bluffBias *
      difficulty.bluffFactor *
      (rivalryHeat * 0.22 + userNeed * 0.22 + (hasTag(player, "marquee") ? 0.8 : 0.25));

    return roundPrice(
      Math.min(2.5, Math.max(0, padding + Math.max(0, valuation - player.marketValue) * 0.12))
    );
  }

  function maybeAiBid(now) {
    const lot = getCurrentLot();
    if (!lot || now < lot.nextAiActionAt) {
      return;
    }

    const picked = chooseAutoBidder(false);

    if (!picked) {
      lot.nextAiActionAt = now + randomBetween(0.4, 1.15) * 1000;
      return;
    }

    placeBid(picked.team.id);
  }

  function maybeProxyBid(now) {
    const lot = getCurrentLot();
    const userTeam = getUserTeam();
    const proxy = state?.auction.proxy;

    if (!lot || !proxy || proxy.playerId !== lot.playerId || !userTeam) {
      return;
    }

    const nextBid = getNextBidValue();
    if (
      lot.leadingBidderId === state.userFranchiseId ||
      !canTeamBid(userTeam, getCurrentPlayer(), nextBid) ||
      nextBid > proxy.maxBid + 0.0001 ||
      now < lot.nextProxyActionAt
    ) {
      return;
    }

    placeBid(userTeam.id, { fromProxy: true });
  }

  /**
   * Estimates the minimum budget a team must keep in reserve after winning a bid,
   * beyond the basic per-slot minimum, to ensure critical roster gaps can still be filled.
   *
   * Specifically protects the WK slot: if a team has no keeper yet and is bidding on
   * a non-WK player, it reserves the cheapest available WK's base price so it cannot
   * accidentally price itself out of buying a keeper later.
   */
  function estimateCriticalReserve(team, player) {
    // Must reserve enough for mandatory minimum squad slots
    const slotsAfterWin = Math.max(0, getSlotsLeft(team) - 1);
    const mandatorySlots = Math.max(0, SETTINGS.minSquadSize - team.squad.length - 1);
    const reserveSlots = Math.max(slotsAfterWin, mandatorySlots);
    let reserve = reserveSlots * SETTINGS.minimumBid;

    const needs = getNeedSnapshot(team);
    // If keeper slot is still open and this lot is NOT a WK, protect WK budget
    if (needs.keeper.deficit > 0 && player.role !== "WK") {
      const cheapestAvailableWK = state.players
        .filter((p) => p.status === "available" && p.role === "WK" && p.id !== player.id)
        .sort((a, b) => a.basePrice - b.basePrice)[0];
      if (cheapestAvailableWK) {
        reserve = Math.max(reserve, reserveSlots * SETTINGS.minimumBid + cheapestAvailableWK.basePrice);
      }
    }
    // If no bowlers yet and this lot is not a bowler, protect bowler budget
    if (needs.pace.deficit > 0 && needs.spin.deficit > 0 && player.role !== "BWL") {
      const cheapestBowler = state.players
        .filter((p) => p.status === "available" && p.role === "BWL" && p.id !== player.id)
        .sort((a, b) => a.basePrice - b.basePrice)[0];
      if (cheapestBowler) {
        reserve = Math.max(reserve, reserveSlots * SETTINGS.minimumBid + cheapestBowler.basePrice);
      }
    }

    return reserve;
  }

  function getAutoBidContenders(includeUserTeam = false) {
    const player = getCurrentPlayer();
    const nextBid = getNextBidValue();

    if (!player) {
      return [];
    }

    return state.franchises
      .filter((team) => includeUserTeam || team.id !== state.userFranchiseId)
      .map((team) => {
        if (!canTeamBid(team, player, nextBid)) {
          return null;
        }

        // Strategic reserve protection: don't overbid if critical needs remain
        const criticalReserve = estimateCriticalReserve(team, player);
        if (team.purse - nextBid < criticalReserve - 0.0001) {
          return null;
        }

        const valuation = calculateTeamValuation(team, player);
        const bluffCap = roundPrice(valuation + computeBluffPadding(team, player, valuation));
        if (nextBid > bluffCap + 0.0001) {
          return null;
        }

        const pricePenalty = Math.max(0, nextBid - valuation) * 2.3;
        let appetite =
          getNeedPressure(team, player) * 1.28 +
          team.aggression * 2.1 +
          calculateScarcity(player) * 0.8 +
          getStrategyAlignment(team, player) -
          pricePenalty +
          nextRandom() * 1.2;

        // IPL rule: teams below minimum squad size MUST buy — massive urgency boost
        const shortfall = SETTINGS.minSquadSize - team.squad.length;
        if (shortfall > 0) {
          appetite += shortfall * 2.5;
          // At base price in accelerated phase, always bid if below minimum
          if (state.auction.acceleratedPhase && nextBid <= player.basePrice + 0.0001) {
            appetite = Math.max(appetite, 10);
          }
        }

        return appetite > 1.55 ? { team, appetite } : null;
      })
      .filter(Boolean)
      .sort((left, right) => right.appetite - left.appetite);
  }

  function chooseAutoBidder(includeUserTeam = false) {
    const contenders = getAutoBidContenders(includeUserTeam);
    if (!contenders.length) {
      return null;
    }
    const frontGroup = contenders.slice(0, Math.min(3, contenders.length));
    return frontGroup[Math.floor(nextRandom() * frontGroup.length)];
  }

  function placeBid(teamId, options = {}) {
    const { fromProxy = false, silent = false } = options;
    const lot = getCurrentLot();
    const player = getCurrentPlayer();
    const team = getTeamById(teamId);
    const bidValue = getNextBidValue();

    if (!lot || !player || !canTeamBid(team, player, bidValue)) {
      return false;
    }

    // Save undo snapshot before overwriting lot state (manual user bids only)
    if (teamId === state.userFranchiseId && !fromProxy) {
      undoBidSnapshot = {
        playerId: lot.playerId,
        currentBid: lot.currentBid,
        leadingBidderId: lot.leadingBidderId,
      };
    }

    lot.currentBid = bidValue;
    lot.leadingBidderId = teamId;
    lot.timer = getSpeed().resetClock;
    lot.nextAiActionAt = performance.now() + randomBetween(0.45, 1.05) * 1000;
    lot.nextProxyActionAt = performance.now() + randomBetween(0.25, 0.72) * 1000;

    const valueGap = roundPrice(calculateTeamValuation(team, player) - bidValue);
    addLog(
      `${team.short} bids ${formatCrore(bidValue)} for ${player.name}${fromProxy ? " via proxy" : ""}.`,
      valueGap >= 0.75 ? "positive" : valueGap < 0 ? "danger" : "warning"
    );

    if (!silent) {
      render();
      flashBidTile();
      persistState();
    }
    return true;
  }

  function flashBidTile() {
    const tile = refs.currentBidTile;
    if (!tile) return;
    tile.classList.remove("bid-flash");
    void tile.offsetWidth; // force reflow so animation restarts
    tile.classList.add("bid-flash");
  }

  function undoBid() {
    const lot = getCurrentLot();
    if (!lot || !undoBidSnapshot || undoBidSnapshot.playerId !== lot.playerId) {
      return;
    }
    lot.currentBid = undoBidSnapshot.currentBid;
    lot.leadingBidderId = undoBidSnapshot.leadingBidderId;
    lot.timer = getSpeed().resetClock;
    undoBidSnapshot = null;
    addLog("Last bid undone.", "warning");
    render();
    persistState();
  }

  /**
   * Skip the current lot (pass on the player without bidding).
   * Rules:
   *   - Only allowed if no bids have been placed (leadingBidderId is null).
   *   - Only allowed during "running" phase, not accelerated repeat round.
   *   - Skipped players are re-queued at the back of the accelerated phase so
   *     they still get a chance to sell to other teams.
   *   - Each player can only be skipped once — second appearance they must be
   *     bid on or go unsold.
   *   - Not available if no teams can afford any more players (auto-ends auction).
   */
  function skipCurrentLot() {
    if (!state || state.auction.status !== "running") return;
    const lot = getCurrentLot();
    if (!lot) return;

    // Can't skip if a bid has already been placed
    if (lot.leadingBidderId !== null) {
      addLog("Can't skip — a bid is already on the table.", "warning");
      return;
    }

    // Can't skip in accelerated phase (players are already on second chance)
    if (state.auction.acceleratedPhase) {
      addLog("No skips in the accelerated round — lot goes unsold.", "warning");
      // Treat as unsold and advance
      markLotUnsold(lot);
      startNextLot();
      render();
      persistState();
      return;
    }

    const player = getPlayerById(lot.playerId);
    if (!player) return;

    // Mark as skipped — will rejoin queue during accelerated phase
    player.status = "skipped";
    state.auction.currentLot = null;
    undoBidSnapshot = null;

    addLog(`${player.name} passed. Will return in the accelerated round.`, "warning");
    startNextLot();
    render();
    persistState();
  }

  function markLotUnsold(lot) {
    const player = getPlayerById(lot.playerId);
    if (player) player.status = "unsold";
    state.auction.soldLots.push({
      playerId: lot.playerId,
      teamId: null,
      price: 0,
      fairValue: player ? player.marketValue : 0,
    });
    state.auction.currentLot = null;
  }

  function getAvailablePlayers() {
    return state.players.filter((player) => player.status === "available");
  }

  /**
   * IPL-style tiered auction sets with randomization within each tier.
   * Set 1: Marquee players (tagged "marquee") — the headline lots
   * Set 2: Capped Stars (base price >= 1.5 cr) — premium internationals
   * Set 3: Capped Players (base price >= 0.75 cr) — experienced squad builders
   * Set 4: Uncapped / Youth (base price < 0.75 cr) — emerging talent pool
   * Within each set, order is randomized so every auction plays out differently.
   */
  function generateAuctionQueue(players) {
    const marquee = [];
    const stars = [];
    const capped = [];
    const uncapped = [];

    for (const p of players) {
      if (hasTag(p, "marquee")) marquee.push(p);
      else if (p.basePrice >= 1.5) stars.push(p);
      else if (p.basePrice >= 0.75) capped.push(p);
      else uncapped.push(p);
    }

    // Fisher-Yates shuffle using the seeded RNG
    function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(nextRandom() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    return [
      ...shuffle(marquee),
      ...shuffle(stars),
      ...shuffle(capped),
      ...shuffle(uncapped),
    ].map((p) => p.id);
  }

  /**
   * Generates the "Nomination Angle" caption shown in the spotlight for each lot.
   * Explains why this player is appearing at this point in the auction.
   */
  function generateLotReason(player) {
    const demand = countLeagueDemand(player);
    if (hasTag(player, "marquee")) {
      return `Marquee lot. ${player.name} is one of the headline names — expect the room to compete from the base price.`;
    }
    if (player.basePrice >= 2) {
      return `Premium bracket. ${player.style} enters at ${formatCrore(player.basePrice)} — a budget-shaping lot for every franchise.`;
    }
    if (player.role === "WK" && demand >= 3) {
      return `Wicketkeeper pool is live. ${demand} franchises still need a first-choice gloveman — competition will be fierce.`;
    }
    if (demand >= 5) {
      return `High-demand lot. ${demand} franchises are showing strong interest — scarcity will push this above base.`;
    }
    if (state.auction.acceleratedPhase) {
      return `Accelerated auction. ${player.name} re-enters at base price ${formatCrore(player.basePrice)} — value opportunity for squads with open slots.`;
    }
    if (hasTag(player, "death") || hasTag(player, "powerplay")) {
      return `Phase specialist. ${player.style} — teams with specific phase gaps will contest firmly.`;
    }
    return `${formatRole(player.role)} pool. ${player.style}.`;
  }

  function startNextLot() {
    if (!state) return;

    // End if all teams are full or no players remain (available + skipped)
    const remaining = state.players.filter((p) => p.status === "available" || p.status === "skipped");
    const teamsNeedPlayers = state.franchises.some((t) => t.squad.length < SETTINGS.minSquadSize);
    if (state.franchises.every((team) => getSlotsLeft(team) === 0) || (remaining.length === 0 && !teamsNeedPlayers)) {
      finishAuctionAndStartSeason();
      return;
    }
    // If no available players but teams still below minimum, force-fill from unsold pool
    if (remaining.length === 0 && teamsNeedPlayers) {
      forceAssignUnsoldPlayers();
      finishAuctionAndStartSeason();
      return;
    }

    // Advance through the pre-ordered queue to the next available player
    const queue = state.auction.queue;
    let nextPlayer = null;

    while (state.auction.queueIndex < queue.length) {
      const candidate = getPlayerById(queue[state.auction.queueIndex]);
      state.auction.queueIndex += 1;
      if (candidate && candidate.status === "available") {
        nextPlayer = candidate;
        break;
      }
    }

    // Primary queue exhausted — enter accelerated phase
    // Includes any players that were skipped earlier (they get one more chance)
    if (!nextPlayer) {
      if (!state.auction.acceleratedPhase) {
        state.auction.acceleratedPhase = true;
        // Reactivate skipped players as "available" so they re-enter the pool
        const skipped = state.players.filter((p) => p.status === "skipped");
        skipped.forEach((p) => { p.status = "available"; });
        const skippedCount = skipped.length;
        addLog(
          `Primary lots complete. Accelerated round opens${skippedCount > 0 ? ` — ${skippedCount} skipped player(s) return` : ""}.`,
          "warning"
        );
      }
      const unsold = getAvailablePlayers();
      if (!unsold.length) {
        finishAuctionAndStartSeason();
        return;
      }
      nextPlayer = unsold[0];
    }

    // Edge case: if NO team can afford even the base price, auto-skip this player
    const minBid = nextPlayer.basePrice;
    const anyCanBid = state.franchises.some((team) => canTeamBid(team, nextPlayer, minBid));
    if (!anyCanBid) {
      nextPlayer.status = "unsold";
      state.auction.soldLots.push({ playerId: nextPlayer.id, teamId: null, price: 0, fairValue: nextPlayer.marketValue });
      addLog(`${nextPlayer.name} passed — no team can afford the base price. Marked unsold.`, "warning");
      // Recurse to find the next lot
      startNextLot();
      return;
    }

    const speed = getSpeed();
    // Accelerated phase uses a shorter clock (mirrors real IPL)
    const timerDuration = state.auction.acceleratedPhase
      ? roundPrice(speed.openingClock * 0.65)
      : speed.openingClock;

    state.auction.lotNumber += 1;
    state.auction.proxy = null;
    undoBidSnapshot = null;
    state.auction.currentLot = {
      playerId: nextPlayer.id,
      currentBid: nextPlayer.basePrice,
      leadingBidderId: null,
      timer: timerDuration,
      maxTimer: timerDuration,
      reason: generateLotReason(nextPlayer),
      nextAiActionAt: performance.now() + randomBetween(0.45, 1.25) * 1000,
      nextProxyActionAt: performance.now() + randomBetween(0.25, 0.7) * 1000,
    };

    refs.maxBidInput.value = formatRawNumber(
      calculateTeamValuation(getUserTeam(), nextPlayer)
    );
    addLog(
      `Lot ${state.auction.lotNumber}: ${nextPlayer.name} — ${nextPlayer.style} at ${formatCrore(nextPlayer.basePrice)}.`,
      "warning"
    );
    render();
    persistState();
  }

  function settleCurrentLot(scheduleNextLot = true, silent = false) {
    const lot = getCurrentLot();
    const player = getCurrentPlayer();

    if (!lot || !player) {
      return;
    }

    if (!lot.leadingBidderId) {
      player.status = "unsold";
      state.auction.soldLots.push({
        lot: state.auction.lotNumber,
        playerId: player.id,
        teamId: null,
        price: 0,
        fairValue: player.marketValue,
      });
      addLog(`${player.name} goes unsold. The room held its nerve.`, "warning");
    } else {
      const buyer = getTeamById(lot.leadingBidderId);
      player.status = "sold";
      buyer.purse = roundPrice(buyer.purse - lot.currentBid);
      buyer.spent = roundPrice(buyer.spent + lot.currentBid);
      buyer.squad.push(player.id);
      buyer.contracts[player.id] = assignContractYears(player);
      state.auction.soldLots.push({
        lot: state.auction.lotNumber,
        playerId: player.id,
        teamId: buyer.id,
        price: lot.currentBid,
        fairValue: player.marketValue,
      });
      addLog(
        `Hammer down. ${player.name} joins ${buyer.short} for ${formatCrore(lot.currentBid)}.`,
        lot.currentBid <= player.marketValue + 0.5 ? "positive" : "danger"
      );
    }

    state.auction.currentLot = null;
    if (!silent) {
      render();
      persistState();
    }

    if (scheduleNextLot) {
      window.setTimeout(() => {
        if (!state || state.auction.status === "complete") {
          return;
        }
        startNextLot();
      }, 520);
    }
  }

  function closeCurrentLot() {
    settleCurrentLot(true, false);
  }

  /**
   * IPL rule: every franchise must have at least minSquadSize players.
   * If the auction runs out of biddable lots but some teams are short,
   * assign unsold players to those teams at base price (cheapest first),
   * respecting the overseas cap.
   */
  function forceAssignUnsoldPlayers() {
    // Equalize squad sizes: keep filling the most-needy teams first until all
    // reach squadSize or no more unsold players can be assigned.
    // No purse check — this is a game-rule override; cost is capped at team's remaining purse.
    let safety = 0;
    while (safety < 400) {
      safety++;

      const unsold = state.players
        .filter((p) => p.status === "unsold")
        .sort((a, b) => a.basePrice - b.basePrice);
      if (!unsold.length) break;

      const minCount = Math.min(...state.franchises.map((t) => t.squad.length));
      if (minCount >= SETTINGS.squadSize) break;

      // Only fill teams sitting at the current minimum (keeps counts as equal as possible)
      const needyTeams = state.franchises.filter(
        (t) => t.squad.length === minCount && t.squad.length < SETTINGS.squadSize
      );

      let assigned = false;
      for (const team of needyTeams) {
        const pick = unsold.find((p) => {
          if (p.status !== "unsold") return false;
          if (p.overseas && getOverseasCount(team) >= SETTINGS.maxOverseas) return false;
          return true;
        });
        if (!pick) continue;

        const cost = roundPrice(Math.min(pick.basePrice, Math.max(0, team.purse)));
        pick.status = "sold";
        team.squad.push(pick.id);
        team.contracts[pick.id] = assignContractYears(pick, true);
        team.purse = roundPrice(team.purse - cost);
        team.spent = roundPrice(team.spent + cost);
        state.auction.soldLots.push({
          lot: state.auction.lotNumber,
          playerId: pick.id,
          teamId: team.id,
          price: cost,
          fairValue: pick.marketValue,
        });
        addLog(
          `${pick.name} auto-assigned to ${team.short} at ${formatCrore(cost)} (squad equalization).`,
          "warning"
        );
        assigned = true;
      }
      if (!assigned) break;
    }
  }

  function finishAuctionAndStartSeason() {
    // IPL rule: force-fill any teams still below minimum squad size
    forceAssignUnsoldPlayers();

    state.auction.status = "complete";
    state.auction.currentLot = null;
    initializeSeason();
    addLog("Auction complete. The league schedule is now live.", "positive");
    render();
    persistState();
  }

  function simulateCurrentLotInstant() {
    const lot = getCurrentLot();
    if (!lot) {
      return false;
    }

    let bidSafety = 0;
    while (bidSafety < 200) {
      const picked = chooseAutoBidder(true);
      if (!picked) {
        break;
      }
      placeBid(picked.team.id, { silent: true });
      bidSafety += 1;
    }

    settleCurrentLot(false, true);
    return true;
  }

  // ── Auction sim cancel flag ───────────────────────────────────────────────
  let _auctionSimCancelled = false;

  function cancelAuctionSim() {
    _auctionSimCancelled = true;
  }

  function simulateRemainingAuction() {
    if (!state || state.auction.status === "complete") return;
    if (state.auction.status === "paused") state.auction.status = "running";

    _auctionSimCancelled = false;
    const totalPlayers = state.players.length;
    const startingLot  = state.auction.lotNumber;
    let resolvedLots   = 0;
    let topSale        = { name: "--", price: 0 };

    // Show overlay
    refs.auctionSimOverlay.setAttribute("aria-hidden", "false");
    refs.simLiveFeed.innerHTML = "";
    refs.simStatSold.textContent   = "0";
    refs.simStatUnsold.textContent = "0";
    refs.simStatAvg.textContent    = "0.00 cr";
    refs.simStatTop.textContent    = "--";
    refs.simProgressBar.style.width = "0%";
    refs.simOverlayPhase.textContent = getAuctionPhaseLabel();
    refs.simOverlayDesc.textContent  = "Resolving opening lots\u2026";
    refs.cancelSimBtn.disabled = false;
    refs.simAuctionBtn.classList.add("loading");

    const BATCH = 6; // lots per animation frame

    function processBatch() {
      if (_auctionSimCancelled) {
        closeAuctionSimOverlay(resolvedLots, startingLot);
        return;
      }

      for (let i = 0; i < BATCH; i++) {
        if (state.auction.status === "complete") break;

        if (!getCurrentLot()) {
          startNextLot();
          if (state.auction.status === "complete") break;
        }

        if (getCurrentLot()) {
          const beforeLot  = getCurrentLot();
          const playerBefore = getPlayerById(beforeLot.playerId);
          simulateCurrentLotInstant();
          resolvedLots += 1;

          // Record what just happened for the live feed
          if (playerBefore) {
            const soldEntry = state.auction.soldLots.find((s) => s.playerId === playerBefore.id);
            if (soldEntry && soldEntry.teamId) {
              const buyer = getTeamById(soldEntry.teamId);
              addSimFeedEntry(playerBefore.name, buyer.short, soldEntry.price, "sold");
              if (soldEntry.price > topSale.price) {
                topSale = { name: playerBefore.name, price: soldEntry.price };
              }
            } else {
              addSimFeedEntry(playerBefore.name, "Unsold", 0, "unsold");
            }
          }
        }
      }

      // Update overlay stats
      const sold   = state.auction.soldLots.filter((s) => s.teamId !== null);
      const unsold = state.auction.soldLots.filter((s) => s.teamId === null);
      const avg    = sold.length ? sold.reduce((s, l) => s + l.price, 0) / sold.length : 0;
      const done   = state.auction.lotNumber;
      const pct    = Math.min(100, Math.round((done / Math.max(1, totalPlayers)) * 100));

      refs.simProgressBar.style.width    = `${pct}%`;
      refs.simProgressLots.textContent   = `Lot ${done} / ${totalPlayers}`;
      refs.simProgressPct.textContent    = `${pct}%`;
      refs.simStatSold.textContent       = String(sold.length);
      refs.simStatUnsold.textContent     = String(unsold.length);
      refs.simStatAvg.textContent        = formatCrore(avg);
      refs.simStatTop.textContent        = topSale.price > 0
        ? `${topSale.name} (${formatCrore(topSale.price)})`
        : "--";
      refs.simOverlayPhase.textContent   = getAuctionPhaseLabel();
      refs.simOverlayDesc.textContent    = describeCurrentPhase(done, totalPlayers);

      if (state.auction.status !== "complete" && !_auctionSimCancelled) {
        requestAnimationFrame(processBatch);
      } else {
        closeAuctionSimOverlay(resolvedLots, startingLot);
      }
    }

    requestAnimationFrame(processBatch);
  }

  function describeCurrentPhase(done, total) {
    const ratio = done / Math.max(1, total);
    if (state.auction.acceleratedPhase) return "Accelerated round — final lots up for grabs.";
    if (ratio < 0.15) return "Opening sets — marquee players driving big numbers.";
    if (ratio < 0.35) return "Premium lots — roles filling fast across franchises.";
    if (ratio < 0.65) return "Core bidding — depth and specialists finding homes.";
    if (ratio < 0.88) return "Budget battle — remaining crores being fought over.";
    return "Final lots — last value picks before the hammer drops.";
  }

  function addSimFeedEntry(playerName, teamOrStatus, price, type) {
    const el = document.createElement("div");
    el.className = `sim-feed-entry ${type}`;
    el.innerHTML = `
      <span class="sim-feed-name">${playerName}</span>
      <span class="sim-feed-team">${teamOrStatus}</span>
      <span class="sim-feed-price">${type === "sold" ? formatCrore(price) : "Unsold"}</span>
    `;
    refs.simLiveFeed.prepend(el);
    // Keep only 5 visible entries
    while (refs.simLiveFeed.children.length > 5) {
      refs.simLiveFeed.removeChild(refs.simLiveFeed.lastChild);
    }
  }

  function closeAuctionSimOverlay(resolvedLots, startingLot) {
    // Final progress bar fill
    refs.simProgressBar.style.width = "100%";
    refs.simProgressPct.textContent = "100%";
    refs.simOverlayDesc.textContent = _auctionSimCancelled
      ? `Simulation cancelled at lot ${state.auction.lotNumber}.`
      : `All ${resolvedLots} lots resolved. Auction complete.`;
    refs.cancelSimBtn.disabled = true;
    refs.simAuctionBtn.classList.remove("loading");

    addLog(
      `Auction simulation finished. ${resolvedLots} lots auto-resolved from lot ${startingLot + 1}.`,
      "positive"
    );
    render();
    persistState();

    // Auto-close overlay after a brief pause to show 100%
    setTimeout(() => {
      refs.auctionSimOverlay.setAttribute("aria-hidden", "true");
    }, 1400);
  }

  function initializeSeason() {
    state.season.status = "league";
    state.season.fixtures = buildLeagueFixtures(state.franchises.map((team) => team.id));
    state.season.currentFixtureIndex = 0;
  }

  function buildLeagueFixtures(teamIds) {
    const rotation = [...teamIds];
    const half = rotation.length / 2;
    const firstLeg = [];

    for (let round = 0; round < rotation.length - 1; round += 1) {
      for (let index = 0; index < half; index += 1) {
        const homeSeed = rotation[index];
        const awaySeed = rotation[rotation.length - 1 - index];
        const swap = (round + index) % 2 === 0;
        firstLeg.push({
          id: `league-${round + 1}-${index + 1}`,
          phase: "League",
          round: round + 1,
          homeId: swap ? awaySeed : homeSeed,
          awayId: swap ? homeSeed : awaySeed,
          played: false,
          result: null,
        });
      }

      const fixed = rotation[0];
      const rest = rotation.slice(1);
      rest.unshift(rest.pop());
      rotation.splice(0, rotation.length, fixed, ...rest);
    }

    const secondLeg = firstLeg.map((fixture, index) => ({
      ...fixture,
      id: `league-${fixture.round + rotation.length - 1}-${index + 1}`,
      round: fixture.round + rotation.length - 1,
      homeId: fixture.awayId,
      awayId: fixture.homeId,
      played: false,
      result: null,
    }));

    return [...firstLeg, ...secondLeg];
  }

  function getSortedTable() {
    return Object.values(state.season.table).sort((left, right) => {
      if (right.points !== left.points) {
        return right.points - left.points;
      }
      if (right.nrr !== left.nrr) {
        return right.nrr - left.nrr;
      }
      if (right.won !== left.won) {
        return right.won - left.won;
      }
      const rightScore = calculateSquadScore(getTeamById(right.teamId));
      const leftScore = calculateSquadScore(getTeamById(left.teamId));
      return rightScore - leftScore;
    });
  }

  function seedPlayoffsIfNeeded() {
    if (state.season.status !== "league" || state.season.currentFixtureIndex < state.season.fixtures.length) {
      return;
    }

    const topFour = getSortedTable().slice(0, 4).map((entry) => entry.teamId);
    state.season.status = "playoffs";
    state.season.fixtures.push(
      {
        id: "qualifier-1",
        phase: "Qualifier 1",
        round: 19,
        homeId: topFour[0],
        awayId: topFour[1],
        played: false,
        result: null,
      },
      {
        id: "eliminator",
        phase: "Eliminator",
        round: 19,
        homeId: topFour[2],
        awayId: topFour[3],
        played: false,
        result: null,
      }
    );

    addLog(
      `Playoffs set: ${getTeamById(topFour[0]).short}, ${getTeamById(topFour[1]).short}, ${getTeamById(topFour[2]).short}, and ${getTeamById(topFour[3]).short} are through.`,
      "positive"
    );
  }

  function ensureNextPlayoffFixture(lastFixture, result) {
    const playoff = state.season.playoff;

    if (lastFixture.phase === "Qualifier 1") {
      playoff.q1Winner = result.winnerId;
      playoff.q1Loser = result.loserId;
    }
    if (lastFixture.phase === "Eliminator") {
      playoff.elimWinner = result.winnerId;
    }
    if (
      playoff.q1Winner &&
      playoff.q1Loser &&
      playoff.elimWinner &&
      !playoff.addedQ2
    ) {
      state.season.fixtures.push({
        id: "qualifier-2",
        phase: "Qualifier 2",
        round: 20,
        homeId: playoff.q1Loser,
        awayId: playoff.elimWinner,
        played: false,
        result: null,
      });
      playoff.addedQ2 = true;
      addLog("Qualifier 2 is locked after the first playoff results.", "warning");
    }
    if (lastFixture.phase === "Qualifier 2") {
      playoff.q2Winner = result.winnerId;
    }
    if (playoff.q1Winner && playoff.q2Winner && !playoff.addedFinal) {
      state.season.fixtures.push({
        id: "final",
        phase: "Final",
        round: 21,
        homeId: playoff.q1Winner,
        awayId: playoff.q2Winner,
        played: false,
        result: null,
      });
      playoff.addedFinal = true;
      addLog("The final is now set.", "warning");
    }
    if (lastFixture.phase === "Final") {
      state.season.status = "complete";
      state.season.championId = result.winnerId;
      addLog(`${getTeamById(result.winnerId).name} win the title.`, "positive");
    }
  }

  function simulateNextRound() {
    if (!state || state.season.status === "locked" || state.season.status === "complete") return;

    refs.simRoundBtn.classList.add("loading");

    const currentFixture = state.season.fixtures[state.season.currentFixtureIndex];
    if (!currentFixture) {
      seedPlayoffsIfNeeded();
      refs.simRoundBtn.classList.remove("loading");
      render();
      persistState();
      return;
    }

    const round = currentFixture.round;
    // Run in next frame so the button loading state renders first
    requestAnimationFrame(() => {
      do {
        if (!playOneFixture()) break;
      } while (
        state.season.status === "league" &&
        state.season.fixtures[state.season.currentFixtureIndex] &&
        state.season.fixtures[state.season.currentFixtureIndex].round === round
      );

      refs.simRoundBtn.classList.remove("loading");
      render();
      persistState();
      if (state.season.status === "complete") showSeasonAwards();
    });
  }

  function simulateSeason() {
    if (!state || state.season.status === "locked" || state.season.status === "complete") return;

    const totalMatches = state.season.fixtures.length + 3; // league + 3 playoff matches (approx)
    let matchesDone    = state.season.currentFixtureIndex;

    // Show lightweight overlay
    refs.seasonSimOverlay.setAttribute("aria-hidden", "false");
    refs.seasonSimLabel.textContent    = "Simulating Season\u2026";
    refs.seasonProgressBar.style.width = "0%";
    refs.seasonSimLastMatch.textContent = "Kicking off\u2026";
    refs.simSeasonBtn.classList.add("loading");

    const BATCH = 3;

    function processBatch() {
      let safeguard = 0;
      for (let i = 0; i < BATCH; i++) {
        if (state.season.status === "complete" || safeguard > 10) break;
        const played = playOneFixture();
        if (!played) break;
        matchesDone += 1;
        safeguard += 1;
      }

      const total  = Math.max(totalMatches, matchesDone + 1);
      const pct    = Math.min(100, Math.round((matchesDone / total) * 100));
      const latest = state.season.recentMatches[0];

      refs.seasonProgressBar.style.width  = `${pct}%`;
      refs.seasonProgressText.textContent = `Match ${matchesDone} / ${total}`;
      refs.seasonProgressPct.textContent  = `${pct}%`;
      if (latest) refs.seasonSimLastMatch.textContent = latest.summary;

      if (state.season.status !== "complete") {
        requestAnimationFrame(processBatch);
      } else {
        refs.seasonProgressBar.style.width  = "100%";
        refs.seasonProgressPct.textContent  = "100%";
        refs.seasonSimLabel.textContent     = "Season Complete";
        refs.seasonSimLastMatch.textContent = state.season.championId
          ? `${getTeamById(state.season.championId).name} win the title!`
          : "Season finished.";
        refs.simSeasonBtn.classList.remove("loading");
        render();
        persistState();
        setTimeout(() => {
          refs.seasonSimOverlay.setAttribute("aria-hidden", "true");
          showSeasonAwards();
        }, 1800);
      }
    }

    requestAnimationFrame(processBatch);
  }

  function buildMatchEntry(fixture, result) {
    return {
      fixtureId: fixture.id,
      phase: fixture.phase,
      round: fixture.round,
      summary: result.summary,
      winnerId: result.winnerId,
      homeId: fixture.homeId,
      awayId: fixture.awayId,
      homeScore: result.homeScore,
      awayScore: result.awayScore,
      margin: result.margin,
      playerOfMatch: result.playerOfMatch,
      pitchLabel: result.pitch?.label ?? "",
      pitchId: result.pitch?.id ?? "",
      tacticChips: result.tacticChips ?? [],
      innings1TopScorer: result.innings1?.topScorer ?? null,
      innings2TopScorer: result.innings2?.topScorer ?? null,
      innings1TopWickets: result.innings1?.topWicketTaker ?? null,
      innings2TopWickets: result.innings2?.topWicketTaker ?? null,
      innings1Scorecard: result.innings1?.scorecard ?? null,
      innings2Scorecard: result.innings2?.scorecard ?? null,
      firstBattingId: result.firstBattingId,
    };
  }

  function playOneFixture(userTactics = null) {
    if (!state || state.season.status === "locked" || state.season.status === "complete") {
      return false;
    }

    if (state.season.currentFixtureIndex >= state.season.fixtures.length) {
      if (state.season.status === "league") {
        seedPlayoffsIfNeeded();
      } else {
        return false;
      }
    }

    const fixture = state.season.fixtures[state.season.currentFixtureIndex];
    if (!fixture) {
      return false;
    }

    let result;
    try {
      result = simulateFixture(fixture, userTactics);
    } catch (error) {
      console.error("Match simulation error:", error);
      addLog("A match simulation error occurred and was skipped.", "danger");
      state.season.currentFixtureIndex += 1;
      return true;
    }
    fixture.played = true;
    fixture.result = result;
    state.season.recentMatches.unshift(buildMatchEntry(fixture, result));
    state.season.recentMatches = state.season.recentMatches.slice(0, 12);

    trackMatchStats(result);

    if (fixture.phase === "League") {
      updateLeagueTable(fixture, result);
    } else {
      ensureNextPlayoffFixture(fixture, result);
    }

    state.season.currentFixtureIndex += 1;
    addLog(result.summary, result.margin.includes("Super Over") ? "warning" : "positive");

    if (state.season.status === "league") {
      seedPlayoffsIfNeeded();
    }

    return true;
  }

  function ensureSeasonStat(playerId) {
    if (!state.seasonStats[playerId]) {
      state.seasonStats[playerId] = {
        pomAwards: 0, matches: 0,
        // Batting
        innings: 0, notOuts: 0, runs: 0, ballsFaced: 0, fours: 0, sixes: 0,
        highScore: 0, highScoreNotOut: false, fifties: 0, hundreds: 0,
        // Bowling
        oversBowled: 0, runsConceded: 0, wickets: 0, dots: 0,
        bestBowlingWickets: 0, bestBowlingRuns: 999,
        // Fielding
        catches: 0,
      };
    }
    // Migrate old saves that only had the simple structure
    const s = state.seasonStats[playerId];
    if (s.innings === undefined) {
      s.innings = 0; s.notOuts = 0; s.ballsFaced = 0; s.fours = 0; s.sixes = 0;
      s.highScore = 0; s.highScoreNotOut = false; s.fifties = 0; s.hundreds = 0;
      s.oversBowled = 0; s.runsConceded = 0; s.dots = 0;
      s.bestBowlingWickets = 0; s.bestBowlingRuns = 999; s.catches = 0;
    }
  }

  function trackMatchStats(result) {
    // POM
    const pomPlayer = result.playerOfMatchId
      ? state.players.find((p) => p.id === result.playerOfMatchId)
      : state.players.find((p) => p.name === result.playerOfMatch);
    if (pomPlayer) {
      ensureSeasonStat(pomPlayer.id);
      state.seasonStats[pomPlayer.id].pomAwards += 1;
    }

    // Track detailed stats from scorecards for both innings
    [result.innings1, result.innings2].forEach((inn) => {
      if (!inn?.scorecard) {
        // Fallback for old results without scorecards
        if (inn?.topScorerData) {
          ensureSeasonStat(inn.topScorerData.id);
          state.seasonStats[inn.topScorerData.id].runs += inn.topScorerData.runs;
          state.seasonStats[inn.topScorerData.id].matches += 1;
        }
        if (inn?.topWicketTakerData) {
          ensureSeasonStat(inn.topWicketTakerData.id);
          state.seasonStats[inn.topWicketTakerData.id].wickets += inn.topWicketTakerData.wickets;
        }
        return;
      }

      const sc = inn.scorecard;
      const matchedIds = new Set();

      // Batting stats from scorecard
      for (const b of sc.battingCard) {
        ensureSeasonStat(b.id);
        const s = state.seasonStats[b.id];
        if (!matchedIds.has(b.id)) { s.matches += 1; matchedIds.add(b.id); }
        s.innings += 1;
        s.runs += b.runs;
        s.ballsFaced += b.balls;
        s.fours += b.fours;
        s.sixes += b.sixes;
        if (b.notOut) s.notOuts += 1;
        if (b.runs > s.highScore || (b.runs === s.highScore && b.notOut && !s.highScoreNotOut)) {
          s.highScore = b.runs;
          s.highScoreNotOut = b.notOut;
        }
        if (b.runs >= 100) s.hundreds += 1;
        else if (b.runs >= 50) s.fifties += 1;
      }

      // Bowling stats from scorecard
      for (const bw of sc.bowlingCard) {
        ensureSeasonStat(bw.id);
        const s = state.seasonStats[bw.id];
        if (!matchedIds.has(bw.id)) { s.matches += 1; matchedIds.add(bw.id); }
        s.oversBowled += bw.overs;
        s.runsConceded += bw.runsConceded;
        s.wickets += bw.wickets;
        s.dots += bw.dots;
        // Best bowling figures
        if (bw.wickets > s.bestBowlingWickets ||
            (bw.wickets === s.bestBowlingWickets && bw.runsConceded < s.bestBowlingRuns)) {
          s.bestBowlingWickets = bw.wickets;
          s.bestBowlingRuns = bw.runsConceded;
        }
      }

      // Generate some catches from fielding (proportional to wickets, minus bowled/lbw)
      const totalWkts = inn.wickets;
      const catches = Math.max(0, totalWkts - Math.floor(nextRandom() * 3));
      if (catches > 0 && sc.bowlingCard.length > 0) {
        // Distribute catches to fielders (batting side of the other team bowled)
        for (let c = 0; c < catches; c++) {
          const fielder = sc.bowlingCard[Math.floor(nextRandom() * sc.bowlingCard.length)];
          ensureSeasonStat(fielder.id);
          state.seasonStats[fielder.id].catches += 1;
        }
      }
    });
  }

  /**
   * Full phased fixture simulation.
   * @param {object} fixture
   * @param {object|null} userTactics  - tactics chosen by player, or null for AI matches
   * @returns enriched result including pitch, phases, per-performer stats, tactic chips
   */
  function simulateFixture(fixture, userTactics = null) {
    const homeTeam = getTeamById(fixture.homeId);
    const awayTeam = getTeamById(fixture.awayId);
    const homeLineup = selectLineup(homeTeam);
    const awayLineup = selectLineup(awayTeam);
    const homeStrength = calculateLineupStrength(homeTeam, homeLineup);
    const awayStrength = calculateLineupStrength(awayTeam, awayLineup);

    // Assign pitch once (stored on fixture so live replay is consistent)
    const pitch = fixture.pitch ?? generateMatchPitch();
    fixture.pitch = pitch;

    // Toss
    const tossWinner = nextRandom() < 0.5 ? homeTeam : awayTeam;
    const tossWinnerChoosesChase = nextRandom() < 0.6;
    const firstBattingTeam = tossWinnerChoosesChase
      ? tossWinner.id === homeTeam.id ? awayTeam : homeTeam
      : tossWinner;
    const secondBattingTeam = firstBattingTeam.id === homeTeam.id ? awayTeam : homeTeam;

    const firstStrength  = firstBattingTeam.id  === homeTeam.id ? homeStrength : awayStrength;
    const secondStrength = secondBattingTeam.id === homeTeam.id ? homeStrength : awayStrength;
    const firstLineup    = firstBattingTeam.id  === homeTeam.id ? homeLineup  : awayLineup;
    const secondLineup   = secondBattingTeam.id === homeTeam.id ? homeLineup  : awayLineup;

    // Resolve tactic effects:
    //   - When user is BATTING: apply battingMod to their innings
    //   - When user is BOWLING: apply bowlingMod to reduce opponent's innings
    //   - AI-only match: no tactic modifiers
    const userTeamId    = state?.userFranchiseId;
    const userInvolved  = fixture.homeId === userTeamId || fixture.awayId === userTeamId;
    const tacticResult  = (userTactics && userInvolved)
      ? scoreTacticsForPitch(userTactics, pitch, userTeamId === firstBattingTeam.id ? firstLineup : secondLineup)
      : null;
    const captaincyPlan = userTactics?.captaincy
      ? CAPTAINCY_TACTICS.find((c) => c.id === userTactics.captaincy)
      : null;

    const userIsBatting1 = firstBattingTeam.id  === userTeamId;
    const userIsBatting2 = secondBattingTeam.id === userTeamId;

    // Innings 1: user batting → use battingMod; user bowling → apply bowlingMod against opponent
    const inn1BatMod = userIsBatting1
      ? { battingMod: tacticResult?.battingMod ?? 0, bowlingMod: 0 }
      : userInvolved
        ? { battingMod: 0, bowlingMod: tacticResult?.bowlingMod ?? 0 }
        : null;

    // Innings 2: user batting → use battingMod; user bowling → apply bowlingMod against opponent
    const inn2BatMod = userIsBatting2
      ? { battingMod: tacticResult?.battingMod ?? 0, bowlingMod: 0 }
      : userInvolved
        ? { battingMod: 0, bowlingMod: tacticResult?.bowlingMod ?? 0 }
        : null;

    const firstInnings = simulateInningsPhased(
      firstBattingTeam.id, firstStrength, secondStrength, false, 0, pitch, inn1BatMod, fixture.homeId
    );
    const secondInnings = simulateInningsPhased(
      secondBattingTeam.id, secondStrength, firstStrength, true, firstInnings.score + 1, pitch, inn2BatMod, fixture.homeId
    );

    if (captaincyPlan && userInvolved) {
      const userChasing = userTeamId === secondBattingTeam.id;
      if (userChasing) {
        const adjustment = Math.round((captaincyPlan.chaseBonus ?? 0) * 12);
        secondInnings.score = Math.round(clamp(secondInnings.score + adjustment, 80, 260));
      }
    }

    // Generate per-player scorecards for both innings
    const scorecard1 = generateScorecard(firstInnings.score, firstInnings.wickets, firstLineup, secondLineup);
    const scorecard2 = generateScorecard(secondInnings.score, secondInnings.wickets, secondLineup, firstLineup);
    firstInnings.scorecard = scorecard1;
    secondInnings.scorecard = scorecard2;

    const homeScore    = firstBattingTeam.id === homeTeam.id ? firstInnings.score   : secondInnings.score;
    const awayScore    = firstBattingTeam.id === awayTeam.id ? firstInnings.score   : secondInnings.score;
    const homeWickets  = firstBattingTeam.id === homeTeam.id ? firstInnings.wickets : secondInnings.wickets;
    const awayWickets  = firstBattingTeam.id === awayTeam.id ? firstInnings.wickets : secondInnings.wickets;

    let winnerId, loserId, margin;
    if (secondInnings.score > firstInnings.score) {
      winnerId = secondBattingTeam.id; loserId = firstBattingTeam.id;
      margin = `${10 - secondInnings.wickets} wickets`;
    } else if (secondInnings.score < firstInnings.score) {
      winnerId = firstBattingTeam.id; loserId = secondBattingTeam.id;
      margin = `${firstInnings.score - secondInnings.score} runs`;
    } else {
      const soWinner = homeStrength.overall + randomBetween(-5, 5) > awayStrength.overall + randomBetween(-5, 5) ? homeTeam : awayTeam;
      winnerId = soWinner.id; loserId = soWinner.id === homeTeam.id ? awayTeam.id : homeTeam.id;
      margin = "Super Over";
    }

    const winLineup = winnerId === homeTeam.id ? homeLineup : awayLineup;
    const winStrength = winnerId === homeTeam.id ? homeStrength : awayStrength;
    const playerOfMatch = pickPlayerOfMatch(winLineup, winStrength);
    const summary = `${getTeamById(winnerId).short} beat ${getTeamById(loserId).short} by ${margin}. ${playerOfMatch.name} POM.`;

    // Tactic feedback chips (only for user matches)
    const tacticChips = tacticResult?.chips ?? [];

    return {
      winnerId, loserId,
      homeScore: `${homeScore}/${homeWickets}`,
      awayScore: `${awayScore}/${awayWickets}`,
      margin,
      playerOfMatch: playerOfMatch.name,
      playerOfMatchId: playerOfMatch.id,
      summary,
      pitch,
      toss: tossWinner.short,
      firstBattingId: firstBattingTeam.id,
      innings1: firstInnings,
      innings2: secondInnings,
      tacticChips,
    };
  }

  function selectLineup(team) {
    const squad = getTeamPlayers(team);
    // If squad is too small to fill an XI, return everyone we have
    if (squad.length <= 11) return squad.slice();
    const selected = [];
    let overseasUsed = 0;
    const playerOverall = (player) =>
      player.batting * 0.7 +
      player.bowling * 0.7 +
      player.fielding * 0.18 +
      player.temperament * 0.14;

    function canTake(player) {
      if (selected.some((picked) => picked.id === player.id)) {
        return false;
      }
      if (player.overseas && overseasUsed >= SETTINGS.maxPlayingOverseas) {
        return false;
      }
      return true;
    }

    function takePlayers(candidates, count, scoreFn) {
      const prioritized = candidates
        .filter(canTake)
        .sort((left, right) => scoreFn(right) - scoreFn(left));

      for (const player of prioritized) {
        if (count <= 0) {
          break;
        }
        selected.push(player);
        if (player.overseas) {
          overseasUsed += 1;
        }
        count -= 1;
      }

      if (count > 0) {
        const relaxed = candidates
          .filter((player) => canTake(player))
          .sort((left, right) => scoreFn(right) - scoreFn(left));
        for (const player of relaxed) {
          if (count <= 0) {
            break;
          }
          selected.push(player);
          if (player.overseas) {
            overseasUsed += 1;
          }
          count -= 1;
        }
      }
    }

    takePlayers(
      squad.filter((player) => player.role === "WK"),
      1,
      (player) => player.batting * 1.1 + player.fielding * 0.45 + player.temperament * 0.2
    );
    takePlayers(
      squad.filter((player) => player.role === "BAT" || player.role === "WK"),
      4,
      (player) =>
        player.batting +
        player.temperament * 0.25 +
        (hasTag(player, "powerplay") ? 5 : 0) +
        (hasTag(player, "anchor") ? 4 : 0)
    );
    takePlayers(
      squad.filter((player) => player.role === "AR"),
      2,
      (player) => player.batting * 0.65 + player.bowling * 0.65 + player.fielding * 0.2
    );
    takePlayers(
      squad.filter((player) => player.role === "BWL" || player.role === "AR"),
      4,
      (player) =>
        player.bowling +
        player.temperament * 0.2 +
        (hasTag(player, "death") ? 6 : 0) +
        (hasTag(player, "powerplay") ? 4 : 0)
    );

    if (selected.length < 11) {
      takePlayers(
        squad,
        11 - selected.length,
        (player) => playerOverall(player)
      );
    }

    while (selected.filter((player) => player.overseas).length > SETTINGS.maxPlayingOverseas) {
      const removable = [...selected]
        .filter((player) => player.overseas)
        .sort((left, right) => playerOverall(left) - playerOverall(right))[0];
      if (!removable) break;

      const replacement = squad
        .filter(
          (player) =>
            !player.overseas && !selected.some((picked) => picked.id === player.id)
        )
        .sort((left, right) => playerOverall(right) - playerOverall(left))[0];

      const index = selected.findIndex((player) => player.id === removable.id);
      if (replacement) {
        selected.splice(index, 1, replacement);
      } else {
        // No domestic replacement available — drop the overseas player entirely
        // Playing with <11 is better than violating the overseas cap
        selected.splice(index, 1);
      }
    }

    return selected.slice(0, 11);
  }

  function calculateLineupStrength(_team, lineup) {
    const topBatters = [...lineup]
      .sort((left, right) => right.batting - left.batting)
      .slice(0, 6);
    const topBowlers = [...lineup]
      .sort((left, right) => right.bowling - left.bowling)
      .slice(0, 5);
    const batting =
      topBatters.reduce((sum, player) => sum + player.batting, 0) / Math.max(1, topBatters.length);
    const bowling =
      topBowlers.reduce((sum, player) => sum + player.bowling, 0) / Math.max(1, topBowlers.length);
    const fielding =
      lineup.reduce((sum, player) => sum + player.fielding, 0) / Math.max(1, lineup.length);
    const finishing =
      lineup
        .filter((player) => hasTag(player, "finisher"))
        .reduce((sum, player) => sum + player.batting, 0) /
      Math.max(1, lineup.filter((player) => hasTag(player, "finisher")).length || 1);
    const powerplay =
      lineup
        .filter((player) => hasTag(player, "powerplay"))
        .reduce((sum, player) => sum + Math.max(player.batting, player.bowling), 0) /
      Math.max(1, lineup.filter((player) => hasTag(player, "powerplay")).length || 1);
    const leadership = Math.max(...lineup.map((player) => player.temperament));
    const spinDepth = lineup.filter((player) => hasTag(player, "spin") || hasTag(player, "mystery")).length;
    const paceDepth = lineup.filter((player) => hasTag(player, "pace") || hasTag(player, "death")).length;
    const balance = spinDepth >= 2 && paceDepth >= 3 ? 4.5 : spinDepth >= 1 && paceDepth >= 3 ? 2.8 : 0;

    return {
      batting,
      bowling,
      fielding,
      finishing,
      powerplay,
      leadership,
      balance,
      overall: batting * 0.44 + bowling * 0.42 + fielding * 0.08 + leadership * 0.06 + balance,
    };
  }

  // ── Pitch + Tactics Engine ──────────────────────────────────────────────────

  function generateMatchPitch() {
    const weights = [3, 2, 2, 2]; // flat slightly more common
    const total = weights.reduce((s, w) => s + w, 0);
    let r = nextRandom() * total;
    for (let i = 0; i < PITCH_TYPES.length; i++) {
      r -= weights[i];
      if (r <= 0) return PITCH_TYPES[i];
    }
    return PITCH_TYPES[0];
  }

  /**
   * Score how well the chosen tactics match the pitch.
   * Returns a numeric multiplier applied to batting/bowling runs.
   * Positive = tactics suit conditions; negative = wrong call.
   */
  function scoreTacticsForPitch(tactics, pitch, lineup) {
    if (!tactics) return { battingMod: 0, bowlingMod: 0, chips: [] };

    const chips = [];
    let battingMod = 0;
    let bowlingMod = 0;

    // Batting approach
    const bat = BATTING_TACTICS.find((t) => t.id === tactics.batting);
    if (bat) {
      const fit = bat.pitchFit[pitch.id] ?? 0;
      battingMod += fit * 7;
      if (fit >= 1)        chips.push({ label: `${bat.label} on ${pitch.label} ✓`, type: "win" });
      else if (fit <= -0.5) chips.push({ label: `${bat.label} on ${pitch.label} ✗`, type: "loss" });
    }

    // Powerplay bowling
    const pp = POWERPLAY_TACTICS.find((t) => t.id === tactics.powerplay);
    if (pp) {
      const fit = pp.pitchFit[pitch.id] ?? 0;
      // Validate lineup actually has the right bowlers
      const hasPace  = lineup.some((p) => hasTag(p, "pace") || hasTag(p, "death"));
      const hasSpin  = lineup.some((p) => hasTag(p, "spin") || hasTag(p, "mystery"));
      const execBonus = (tactics.powerplay === "pace" && hasPace) || (tactics.powerplay === "spin" && hasSpin) ? 1 : 0.4;
      bowlingMod += fit * 8 * execBonus;
      if (fit >= 1 && execBonus > 0.5) chips.push({ label: `${pp.label} executed ✓`, type: "win" });
      else if (fit <= -1)              chips.push({ label: `${pp.label} backfired ✗`, type: "loss" });
    }

    // Middle overs plan
    const mid = MIDDLE_TACTICS.find((t) => t.id === tactics.middle);
    if (mid) {
      const fit = mid.pitchFit[pitch.id] ?? 0;
      const hasSpin = lineup.some((p) => hasTag(p, "spin") || hasTag(p, "mystery"));
      const execBonus = tactics.middle === "spin_web" && hasSpin ? 1.3 : 0.7;
      bowlingMod += fit * 6 * execBonus;
      if (fit >= 0.5 && execBonus > 0.9) chips.push({ label: `${mid.label} worked ✓`, type: "win" });
      else if (tactics.middle === "spin_web" && !hasSpin)
        chips.push({ label: "No spinners for spin web ✗", type: "loss" });
      else if (fit <= -0.5) chips.push({ label: `${mid.label} ineffective ✗`, type: "loss" });
    }

    // Death bowling
    const death = DEATH_TACTICS.find((t) => t.id === tactics.death);
    if (death) {
      const fit = death.pitchFit[pitch.id] ?? 0;
      const hasDeathSpec = lineup.some((p) => hasTag(p, "death"));
      const execBonus = tactics.death === "specialist" && hasDeathSpec ? 1.2 : 0.7;
      bowlingMod += fit * 6 * execBonus;
      if (fit >= 0.5 && execBonus > 0.9) chips.push({ label: `${death.label} correct ✓`, type: "win" });
      else if (tactics.death === "specialist" && !hasDeathSpec)
        chips.push({ label: "No death specialist in XI ✗", type: "loss" });
    }

    // Field setting
    const field = FIELD_SETTINGS.find((t) => t.id === tactics.field);
    if (field) {
      const fit = field.pitchFit[pitch.id] ?? 0;
      battingMod += (field.battingEffect ?? 0) * 50;
      bowlingMod += (field.bowlingEffect ?? 0) * 50 + fit * 4;
      if (fit >= 0.5) chips.push({ label: `${field.label} suits pitch ✓`, type: "win" });
      else if (fit <= -0.5) chips.push({ label: `${field.label} wrong for pitch ✗`, type: "loss" });
    }

    // Captaincy style
    const cap = CAPTAINCY_TACTICS.find((t) => t.id === tactics.captaincy);
    if (cap) {
      const fit = cap.pitchFit[pitch.id] ?? 0;
      battingMod += (cap.battingEffect ?? 0) * 55 + fit * 3;
      bowlingMod += (cap.bowlingEffect ?? 0) * 45 + fit * 2;
      if (fit >= 0.5) chips.push({ label: `${cap.label} read the game ✓`, type: "win" });
      else if (fit <= -0.5) chips.push({ label: `${cap.label} got exposed ✗`, type: "loss" });
    }

    return { battingMod, bowlingMod, chips };
  }

  /**
   * Simulate one innings in three phases: powerplay (0-6), middle (7-15), death (16-20).
   * @param {string}  teamId      - batting team
   * @param {object}  batting     - calculateLineupStrength result for batting side
   * @param {object}  bowling     - calculateLineupStrength result for bowling side
   * @param {boolean} chasing     - true for 2nd innings
   * @param {number}  target      - runs needed + 1 (1st innings: ignored)
   * @param {object}  pitch       - PITCH_TYPES entry
   * @param {object|null} tacticsMod - { battingMod, bowlingMod } from scoreTacticsForPitch
   * @param {string}  homeId      - home team id for this fixture (for home advantage)
   * Returns { score, wickets, phases, topScorer, topWicketTaker }
   */
  function simulateInningsPhased(teamId, batting, bowling, chasing, target, pitch, tacticsMod, homeId) {
    const difficulty = getDifficulty();
    const homeBonus  = teamId === homeId ? 3 : 0;
    const battingEdge = batting.batting - bowling.bowling;
    const batMod  = (tacticsMod?.battingMod  ?? 0) + homeBonus;
    const bowlMod =  tacticsMod?.bowlingMod  ?? 0;

    // Base run rates per phase (overs: 6 / 9 / 5)
    // Bowl modifier reduces opponent runs — positive bowlMod means our bowling is working well
    const ppBase  = 8.2 + pitch.powerplayRR + battingEdge * 0.05 + batMod * 0.08 - bowlMod * 0.05
                  + randomNormal(0, 0.9 * difficulty.seasonVariance);
    const midBase = 7.4 + pitch.middleRR    + battingEdge * 0.04 - bowlMod * 0.06
                  + randomNormal(0, 0.7 * difficulty.seasonVariance);
    const dtBase  = 9.6 + pitch.deathRR     + batting.finishing * 0.08 - bowlMod * 0.07
                  + batMod * 0.05 + randomNormal(0, 1.1 * difficulty.seasonVariance);

    let ppRuns  = Math.round(clamp(ppBase  * 6, 28, 72));
    let midRuns = Math.round(clamp(midBase * 9, 48, 108));
    let dtRuns  = Math.round(clamp(dtBase  * 5, 30, 82));

    // Wickets per phase — bowling edge increases wicket chance
    const bowlingEdge = bowling.bowling - batting.batting;
    const ppWkts  = Math.round(clamp(randomNormal(1.1 + bowlingEdge * 0.04, 0.8), 0, 3));
    const midWkts = Math.round(clamp(randomNormal(2.0 + bowlingEdge * 0.05, 1.0), 0, 4));
    const dtWkts  = Math.round(clamp(randomNormal(1.8 + bowlingEdge * 0.04, 0.9), 0, 3));

    let totalScore   = ppRuns + midRuns + dtRuns;
    let totalWickets = clamp(ppWkts + midWkts + dtWkts, 1, 10);

    if (chasing) {
      const chaseFactor    = batting.finishing * 0.14 + batting.leadership * 0.04;
      const pressurePenalty = Math.max(0, target - 180) * 0.12;
      totalScore = Math.round(clamp(totalScore + chaseFactor - pressurePenalty, 80, 260));
    }
    totalScore = Math.round(clamp(totalScore, 90, 260));

    // Rescale phase runs so they sum to totalScore (keeps display consistent with total)
    const phaseSum = ppRuns + midRuns + dtRuns;
    if (phaseSum > 0 && phaseSum !== totalScore) {
      const scale = totalScore / phaseSum;
      ppRuns  = Math.round(ppRuns  * scale);
      midRuns = Math.round(midRuns * scale);
      dtRuns  = totalScore - ppRuns - midRuns; // ensure exact sum
    }

    // Generate named performers — use stable pre-computed random scores (fixes comparator bug)
    const squad      = getTeamById(teamId)?.squad ?? [];
    const allPlayers = squad.map((id) => state.players.find((p) => p.id === id)).filter(Boolean);

    const batters  = allPlayers.filter((p) => p.role === "BAT" || p.role === "WK" || p.role === "AR");
    const bowlers  = allPlayers.filter((p) => p.role === "BWL" || p.role === "AR");

    // Stable random sort: compute score once per player, then sort
    const topBatterEntry = batters
      .map((p) => ({ p, score: p.batting + nextRandom() * 12 }))
      .sort((a, b) => b.score - a.score)[0];
    const topBowlerEntry = bowlers
      .map((p) => ({ p, score: p.bowling + nextRandom() * 10 }))
      .sort((a, b) => b.score - a.score)[0];

    const simRuns     = topBatterEntry
      ? Math.round(clamp(totalScore * (0.28 + nextRandom() * 0.24), 16, Math.min(totalScore - 10, 120)))
      : 0;
    const simWickets  = Math.min(4, 1 + Math.floor(nextRandom() * 3));
    const simEconomy  = Math.round((18 + nextRandom() * 18) * 10) / 10;

    return {
      score:    totalScore,
      wickets:  totalWickets,
      phases: [
        { label: "Powerplay", runs: ppRuns,  wickets: ppWkts  },
        { label: "Middle",    runs: midRuns, wickets: midWkts },
        { label: "Death",     runs: dtRuns,  wickets: dtWkts  },
      ],
      topScorer:      topBatterEntry ? `${topBatterEntry.p.name} ${simRuns}` : null,
      topWicketTaker: topBowlerEntry ? `${topBowlerEntry.p.name} ${simWickets}/${simEconomy}` : null,
      // Structured data for Orange/Purple Cap tracking
      topScorerData:      topBatterEntry ? { id: topBatterEntry.p.id, name: topBatterEntry.p.name, runs: simRuns } : null,
      topWicketTakerData: topBowlerEntry ? { id: topBowlerEntry.p.id, name: topBowlerEntry.p.name, wickets: simWickets } : null,
    };
  }

  /**
   * Generate per-player scorecard from aggregate innings totals.
   * Distributes runs/wickets across the lineup based on ratings + randomness.
   */
  function generateScorecard(totalScore, totalWickets, battingLineup, bowlingLineup) {
    // ── BATTING CARD ──
    // Sort lineup by batting position: WK/BAT first, then AR, then BWL
    const posOrder = { WK: 0, BAT: 1, AR: 2, BWL: 3 };
    const batOrder = [...battingLineup].sort((a, b) => (posOrder[a.role] ?? 3) - (posOrder[b.role] ?? 3));

    // Compute raw weights for run distribution
    const rawWeights = batOrder.map((p, i) => {
      const posBonus = i < 3 ? 1.5 : i < 6 ? 1.0 : 0.4;
      const ratingW = (p.batting / 100) * 0.7 + 0.3;
      return posBonus * ratingW * (0.6 + nextRandom() * 0.8);
    });
    const weightSum = rawWeights.reduce((s, w) => s + w, 0) || 1;

    // Decide who got out (pick totalWickets batters, biased toward lower order)
    const dismissalChance = batOrder.map((p, i) => {
      const posRisk = i < 3 ? 0.5 : i < 6 ? 0.7 : 1.0;
      return posRisk * (1 - p.temperament / 200) * (0.5 + nextRandom() * 1.0);
    });
    const sortedByRisk = batOrder.map((p, i) => ({ idx: i, risk: dismissalChance[i] }))
      .sort((a, b) => b.risk - a.risk);
    const dismissedIndices = new Set(sortedByRisk.slice(0, Math.min(totalWickets, batOrder.length - 1)).map((d) => d.idx));

    let runsLeft = totalScore;
    const battingCard = batOrder.map((p, i) => {
      const isLast = i === batOrder.length - 1;
      let runs = isLast ? runsLeft : Math.round(totalScore * rawWeights[i] / weightSum);
      runs = clamp(runs, dismissedIndices.has(i) ? 0 : 0, runsLeft);
      runsLeft -= runs;
      const sr = p.role === "BWL" ? 100 + nextRandom() * 40 : 120 + nextRandom() * 50 + (hasTag(p, "powerplay") ? 15 : 0);
      const balls = runs > 0 ? Math.max(1, Math.round(runs / sr * 100)) : dismissedIndices.has(i) ? Math.max(1, Math.round(nextRandom() * 6)) : 0;
      const sixes = runs >= 12 ? Math.floor(nextRandom() * Math.min(6, runs / 12)) : 0;
      const fours = runs >= 4 ? Math.floor(nextRandom() * Math.min(8, (runs - sixes * 6) / 4)) : 0;
      return {
        id: p.id, name: p.name, role: p.role,
        runs, balls, fours, sixes,
        notOut: !dismissedIndices.has(i) && (runs > 0 || balls > 0),
        sr: balls > 0 ? Math.round(runs / balls * 100) : 0,
      };
    }).filter((b) => b.runs > 0 || b.balls > 0);

    // ── BOWLING CARD ──
    const bowlers = bowlingLineup.filter((p) => p.role === "BWL" || p.role === "AR")
      .sort((a, b) => b.bowling - a.bowling)
      .slice(0, 6);
    // If not enough bowlers, add highest-bowling BAT/WK
    if (bowlers.length < 5) {
      const extras = bowlingLineup.filter((p) => !bowlers.some((b) => b.id === p.id))
        .sort((a, b) => b.bowling - a.bowling);
      while (bowlers.length < 5 && extras.length) bowlers.push(extras.shift());
    }

    // Distribute 20 overs across bowlers (max 4 per bowler in T20)
    const bowlerOvers = bowlers.map((p, i) => {
      const base = i < 4 ? 4 : bowlers.length > 5 ? 2 : 3;
      return { p, overs: base };
    });
    // Adjust to sum to 20
    let oversTotal = bowlerOvers.reduce((s, b) => s + b.overs, 0);
    while (oversTotal > 20 && bowlerOvers.length) {
      const idx = bowlerOvers.length - 1;
      bowlerOvers[idx].overs = Math.max(1, bowlerOvers[idx].overs - 1);
      oversTotal = bowlerOvers.reduce((s, b) => s + b.overs, 0);
    }
    while (oversTotal < 20) {
      for (const b of bowlerOvers) {
        if (b.overs < 4 && oversTotal < 20) { b.overs++; oversTotal++; }
      }
    }

    // Distribute runs conceded (inversely proportional to bowling rating)
    const bowlWeights = bowlerOvers.map((b) => {
      const weakness = 1 - b.p.bowling / 120;
      return b.overs * (0.6 + weakness + nextRandom() * 0.5);
    });
    const bowlWeightSum = bowlWeights.reduce((s, w) => s + w, 0) || 1;
    let runsToDistribute = totalScore;

    // Distribute wickets proportional to bowling rating
    const wktWeights = bowlerOvers.map((b) => (b.p.bowling / 100) * (0.5 + nextRandom() * 1.0));
    const wktWeightSum = wktWeights.reduce((s, w) => s + w, 0) || 1;
    let wicketsLeft = totalWickets;

    const bowlingCard = bowlerOvers.map((b, i) => {
      const isLast = i === bowlerOvers.length - 1;
      let rc = isLast ? runsToDistribute : Math.round(totalScore * bowlWeights[i] / bowlWeightSum);
      rc = clamp(rc, b.overs * 3, Math.min(runsToDistribute, b.overs * 18));
      runsToDistribute -= rc;
      let wkts = isLast ? wicketsLeft : Math.round(totalWickets * wktWeights[i] / wktWeightSum);
      wkts = clamp(wkts, 0, Math.min(wicketsLeft, 4));
      wicketsLeft -= wkts;
      const econ = b.overs > 0 ? Math.round(rc / b.overs * 100) / 100 : 0;
      return {
        id: b.p.id, name: b.p.name, role: b.p.role,
        overs: b.overs, runsConceded: rc, wickets: wkts,
        economy: econ, dots: Math.max(0, Math.round(b.overs * 6 * (0.3 + b.p.bowling / 300))),
      };
    });

    return { battingCard, bowlingCard };
  }

  function pickPlayerOfMatch(lineup, _strength) {
    const sorted = [...lineup].sort((left, right) => {
      const rightScore =
        right.batting * 0.55 +
        right.bowling * 0.45 +
        (hasTag(right, "marquee") ? 6 : 0) +
        (hasTag(right, "captain") ? 3 : 0);
      const leftScore =
        left.batting * 0.55 +
        left.bowling * 0.45 +
        (hasTag(left, "marquee") ? 6 : 0) +
        (hasTag(left, "captain") ? 3 : 0);
      return rightScore - leftScore;
    });

    const weightedFront = sorted.slice(0, 3);
    return weightedFront[Math.floor(nextRandom() * weightedFront.length)] || sorted[0];
  }

  function updateLeagueTable(fixture, result) {
    const homeEntry = state.season.table[fixture.homeId];
    const awayEntry = state.season.table[fixture.awayId];
    const [homeRuns] = result.homeScore.split("/").map(Number);
    const [awayRuns] = result.awayScore.split("/").map(Number);

    homeEntry.played += 1;
    awayEntry.played += 1;
    homeEntry.runsFor += homeRuns;
    homeEntry.runsAgainst += awayRuns;
    awayEntry.runsFor += awayRuns;
    awayEntry.runsAgainst += homeRuns;
    homeEntry.netRuns += homeRuns - awayRuns;
    awayEntry.netRuns += awayRuns - homeRuns;
    homeEntry.nrr = homeEntry.netRuns / homeEntry.played;
    awayEntry.nrr = awayEntry.netRuns / awayEntry.played;

    if (result.winnerId === fixture.homeId) {
      homeEntry.won += 1;
      awayEntry.lost += 1;
      homeEntry.points += 2;
    } else {
      awayEntry.won += 1;
      homeEntry.lost += 1;
      awayEntry.points += 2;
    }
  }

  function calculateSquadScore(team) {
    const players = getTeamPlayers(team);
    const battingCore = players
      .map((player) => player.batting + (hasTag(player, "finisher") ? 6 : 0))
      .sort((left, right) => right - left)
      .slice(0, 6);
    const bowlingCore = players
      .map((player) => player.bowling + (hasTag(player, "death") ? 6 : 0))
      .sort((left, right) => right - left)
      .slice(0, 5);
    const needs = getNeedSnapshot(team);
    const battingAverage =
      battingCore.reduce((sum, value) => sum + value, 0) / Math.max(1, battingCore.length);
    const bowlingAverage =
      bowlingCore.reduce((sum, value) => sum + value, 0) / Math.max(1, bowlingCore.length);
    const deficitPenalty = Object.values(needs).reduce(
      (sum, need) => sum + (Number.isFinite(need.deficit) ? need.deficit : 0),
      0
    );

    return battingAverage * 0.44 + bowlingAverage * 0.44 + team.purse * 0.12 + players.length * 1.3 - deficitPenalty * 3.1;
  }

  function getLeaderboardEntries() {
    if (!state) {
      return [];
    }

    if (state.season.status === "league" || state.season.status === "playoffs" || state.season.status === "complete") {
      const baseEntries = state.franchises.map((team) => {
        const table = state.season.table[team.id];
        const score =
          calculateSquadScore(team) +
          table.points * 7 +
          table.nrr * 12 +
          (state.season.championId === team.id ? 100 : 0);
        return { team, score };
      });
      const total = baseEntries.reduce((sum, entry) => sum + Math.exp(entry.score / 22), 0);
      return baseEntries
        .map((entry) => ({
          ...entry,
          odds:
            state.season.status === "complete"
              ? entry.team.id === state.season.championId
                ? 100
                : 0
              : (Math.exp(entry.score / 22) / Math.max(0.0001, total)) * 100,
        }))
        .sort((left, right) => right.score - left.score);
    }

    const entries = state.franchises.map((team) => ({
      team,
      score: calculateSquadScore(team),
    }));
    const total = entries.reduce((sum, entry) => sum + Math.exp(entry.score / 18), 0);
    return entries
      .map((entry) => ({
        ...entry,
        odds: (Math.exp(entry.score / 18) / Math.max(0.0001, total)) * 100,
      }))
      .sort((left, right) => right.score - left.score);
  }

  function getAuctionPhaseLabel() {
    if (!state) return "Waiting";
    const sn = state.seasonNumber ?? 1;
    if (state.season.status === "league") return `S${sn} League Stage`;
    if (state.season.status === "playoffs") return `S${sn} Playoffs`;
    if (state.season.status === "complete") return `S${sn} Complete`;
    if (state.auction.status === "paused") return "Auction Paused";
    if (state.auction.acceleratedPhase) return "Accelerated Auction";
    const ratio = state.auction.soldLots.length / Math.max(1, state.players.length);
    if (ratio < 0.25) return "Premium Sets";     // High base-price players, marquee lots
    if (ratio < 0.65) return "Core Bidding";     // Mid-tier and role depth
    return "Budget Battle";                       // Final slots, value hunting
  }

  function getSeasonStatusText() {
    if (!state) {
      return "Auction locked";
    }
    if (state.season.status === "locked") {
      return "Auction locked";
    }
    if (state.season.status === "league") {
      const next = state.season.fixtures[state.season.currentFixtureIndex];
      return next ? `Round ${next.round}` : "League complete";
    }
    if (state.season.status === "playoffs") {
      const next = state.season.fixtures[state.season.currentFixtureIndex];
      return next ? next.phase : "Playoffs";
    }
    const champ = getTeamById(state.season.championId);
    return champ ? `${champ.short} champions` : "Season complete";
  }

  function getMarketPulseText() {
    if (!state) {
      return "No activity yet";
    }
    if (state.season.status === "league" || state.season.status === "playoffs" || state.season.status === "complete") {
      const latest = state.season.recentMatches[0];
      return latest ? latest.summary : "Season ready";
    }
    if (state.auction.soldLots.length === 0) {
      return "No activity yet";
    }

    const roles = ["WK", "BAT", "AR", "BWL"].map((role) => {
      const sales = state.auction.soldLots.filter(
        (lot) => lot.teamId && getPlayerById(lot.playerId)?.role === role
      );
      if (!sales.length) {
        return { role, ratio: 1 };
      }
      const averagePaid = sales.reduce((sum, lot) => sum + lot.price, 0) / sales.length;
      const averageFair = sales.reduce((sum, lot) => sum + lot.fairValue, 0) / sales.length;
      return { role, ratio: averagePaid / Math.max(0.25, averageFair) };
    });

    const hottest = roles.reduce((best, current) => (current.ratio > best.ratio ? current : best), roles[0]);
    const coldest = roles.reduce((best, current) => (current.ratio < best.ratio ? current : best), roles[0]);
    return `${formatRole(hottest.role)} running ${
      hottest.ratio >= 1.08 ? "hot" : "steady"
    } | ${formatRole(coldest.role)} still offering value`;
  }

  function getBidAdvice(player) {
    const userTeam = getUserTeam();
    if (!player || !userTeam) {
      return "Start a campaign to unlock live bidding advice.";
    }

    const fairValue = calculateTeamValuation(userTeam, player);
    const nextBid = getNextBidValue();
    const pressure = getNeedPressure(userTeam, player);

    if (nextBid < fairValue - 1) {
      return `Strong buy. Bid confidently up to ${formatCrore(fairValue)} before the room catches up.`;
    }
    if (nextBid <= fairValue + 0.25) {
      return `Playable price. You are near fair value, so bid only if this role fixes a real squad problem.`;
    }
    if (pressure >= 2) {
      return `This role matters to your squad, but the room is asking for a premium. Walk if it breaks ${formatCrore(fairValue)}.`;
    }
    return `Let rivals pay the tax. This lot is above your model and not urgent enough to chase.`;
  }

  function getMarketRead(player) {
    if (!player) {
      return "Market read will unlock when the first lot opens.";
    }

    const roleSales = state.auction.soldLots.filter(
      (lot) => lot.teamId && getPlayerById(lot.playerId)?.role === player.role
    );
    const trend =
      roleSales.length > 0
        ? roleSales.reduce((sum, lot) => sum + lot.price / Math.max(0.25, lot.fairValue), 0) /
          roleSales.length
        : 1;
    const heat = trend >= 1.08 ? "overheated" : trend <= 0.94 ? "discounted" : "balanced";
    return `${formatRole(player.role)} supply is ${
      calculateScarcity(player) >= 1.6 ? "tight" : "comfortable"
    }, with ${countLeagueDemand(player)} franchises showing demand. This role is currently ${heat}.`;
  }

  function getRivalHeatEntries() {
    const player = getCurrentPlayer();
    if (!player) {
      return [];
    }

    const nextBid = getNextBidValue();
    return state.franchises
      .filter((team) => team.id !== state.userFranchiseId)
      .map((team) => {
        const valuation = calculateTeamValuation(team, player);
        const bluffCap = roundPrice(valuation + computeBluffPadding(team, player, valuation));
        const pressure = getNeedPressure(team, player);
        const status =
          nextBid <= valuation
            ? "Likely bid"
            : nextBid <= bluffCap
              ? "Inflation risk"
              : "Probably out";

        return {
          team,
          valuation,
          pressure,
          status,
          heat: pressure * 1.2 + Math.max(0, valuation - nextBid) + team.aggression,
        };
      })
      .sort((left, right) => right.heat - left.heat)
      .slice(0, 5);
  }

  function addLog(message, tone = "neutral") {
    if (!state) {
      return;
    }
    state.logs.unshift({
      id: `${Date.now()}-${Math.floor((state.rngSeed || 1) % 100000)}`,
      lot: state.auction.lotNumber,
      message,
      tone,
    });
    state.logs = state.logs.slice(0, 32);
  }

  function applyTheme() {
    const team = getUserTeam();
    if (!team) {
      return;
    }
    document.documentElement.style.setProperty("--team-primary", team.colors.primary);
    document.documentElement.style.setProperty("--team-secondary", team.colors.secondary);
  }

  function formatCrore(value) {
    return `${Number(value).toFixed(2)} cr`;
  }

  function formatRawNumber(value) {
    return Number(value).toFixed(2);
  }

  function formatRole(role) {
    return role === "WK"
      ? "Wicketkeeper"
      : role === "BAT"
        ? "Batter"
        : role === "AR"
          ? "All-Rounder"
          : "Bowler";
  }

  function formatTimeStamp(timestamp) {
    if (!timestamp) {
      return "Not saved";
    }
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  function assignContractYears(player, budgetSigning = false) {
    if (hasTag(player, "marquee")) return nextRandom() < 0.55 ? 1 : 2;
    if (budgetSigning) return 1;
    if (player.age <= 24 || hasTag(player, "young")) return nextRandom() < 0.5 ? 3 : 2;
    return nextRandom() < 0.35 ? 1 : nextRandom() < 0.75 ? 2 : 3;
  }

  function triggerRivalScout() {
    if (!state || state.auction.status === "complete") return;
    const user = getUserTeam();
    if (!user || user.purse < 0.2) {
      addLog("Not enough purse for a scouting report (0.20 cr).", "danger");
      return;
    }
    const lot = getCurrentLot();
    const rivals = state.franchises.filter((f) => f.id !== state.userFranchiseId && getSlotsLeft(f) > 0);
    if (!rivals.length) return;
    const target = rivals[Math.floor(nextRandom() * rivals.length)];
    user.purse = roundPrice(user.purse - 0.2);
    user.spent = roundPrice((user.spent || 0) + 0.2);
    state.auctionIntel.scoutedTeamId = target.id;
    state.auctionIntel.revealUntilLot = (state.auction.lotNumber || 0) + 8;
    state.auctionIntel.scansUsed = (state.auctionIntel.scansUsed || 0) + 1;
    addLog(
      `Scouting intel: ${target.short} is revealed for the next 8 lots${lot ? ` (through lot ${state.auctionIntel.revealUntilLot})` : ""}.`,
      "positive"
    );
    render();
    persistState();
  }

  function formatNeedBand(value) {
    if (value >= 4.5) return "Very High";
    if (value >= 3) return "High";
    if (value >= 1.8) return "Medium";
    return "Low";
  }

  // ── Tactics Modal ──────────────────────────────────────────────────────────

  function showTacticsModal(fixture, onConfirm) {
    const homeTeam = getTeamById(fixture.homeId);
    const awayTeam = getTeamById(fixture.awayId);
    const isHome   = fixture.homeId === state.userFranchiseId;
    const opponent = isHome ? awayTeam : homeTeam;
    const pitch    = fixture.pitch ?? generateMatchPitch();
    fixture.pitch  = pitch;

    refs.tacticsMatchTitle.textContent = `vs ${opponent.name} — ${fixture.phase}`;
    refs.tacticsPitchBadge.textContent = `${pitch.emoji} ${pitch.label}`;
    refs.tacticsPitchBadge.dataset.type = pitch.id;
    refs.tacticsPitchDesc.textContent  = pitch.description;
    refs.tacticsPitchHint.textContent  = pitch.tacticsHint;

    // Build tactic button groups
    function buildGroup(container, options, groupKey, defaultId) {
      container.innerHTML = options.map((opt) => {
        const fit = opt.pitchFit[pitch.id] ?? 0;
        const fitClass = fit >= 1 ? "good-fit" : fit <= -0.5 ? "bad-fit" : "";
        const sel = opt.id === defaultId ? "selected" : "";
        return `<button type="button" class="tactic-btn ${fitClass} ${sel}"
                  data-group="${groupKey}" data-id="${opt.id}">
                  <strong>${opt.label}</strong>
                  <span>${opt.desc}</span>
                </button>`;
      }).join("");
    }

    // Smart defaults: pick the best-fit tactic for each group
    const bestBat  = BATTING_TACTICS.reduce((b, t) => (t.pitchFit[pitch.id] ?? 0) > (b.pitchFit[pitch.id] ?? 0) ? t : b);
    const bestPP   = POWERPLAY_TACTICS.reduce((b, t) => (t.pitchFit[pitch.id] ?? 0) > (b.pitchFit[pitch.id] ?? 0) ? t : b);
    const bestMid  = MIDDLE_TACTICS.reduce((b, t) => (t.pitchFit[pitch.id] ?? 0) > (b.pitchFit[pitch.id] ?? 0) ? t : b);
    const bestDth  = DEATH_TACTICS.reduce((b, t) => (t.pitchFit[pitch.id] ?? 0) > (b.pitchFit[pitch.id] ?? 0) ? t : b);
    const bestFld  = FIELD_SETTINGS.reduce((b, t) => (t.pitchFit[pitch.id] ?? 0) > (b.pitchFit[pitch.id] ?? 0) ? t : b);
    const bestCap  = CAPTAINCY_TACTICS.reduce((b, t) => (t.pitchFit[pitch.id] ?? 0) > (b.pitchFit[pitch.id] ?? 0) ? t : b);

    buildGroup(refs.battingTacticOpts,   BATTING_TACTICS,   "batting",   bestBat.id);
    buildGroup(refs.powerplayTacticOpts, POWERPLAY_TACTICS, "powerplay", bestPP.id);
    buildGroup(refs.middleTacticOpts,    MIDDLE_TACTICS,    "middle",    bestMid.id);
    buildGroup(refs.deathTacticOpts,     DEATH_TACTICS,     "death",     bestDth.id);
    buildGroup(refs.fieldTacticOpts,     FIELD_SETTINGS,    "field",     bestFld.id);
    buildGroup(refs.captaincyTacticOpts, CAPTAINCY_TACTICS, "captaincy", bestCap.id);

    pendingTactics = {
      batting: bestBat.id,
      powerplay: bestPP.id,
      middle: bestMid.id,
      death: bestDth.id,
      field: bestFld.id,
      captaincy: bestCap.id,
    };
    updateTacticAdvisor(pitch);

    refs.tacticsModal.classList.add("visible");
    refs.tacticsModal.setAttribute("aria-hidden", "false");

    // Tactic button clicks
    refs.tacticsModal.querySelectorAll(".tactic-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const group = btn.dataset.group;
        refs.tacticsModal.querySelectorAll(`.tactic-btn[data-group="${group}"]`)
          .forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        pendingTactics[group] = btn.dataset.id;
        updateTacticAdvisor(pitch);
      });
    });

    // Form confirm
    refs.tacticsForm.onsubmit = (e) => {
      e.preventDefault();
      hideTacticsModal();
      onConfirm({ ...pendingTactics });
    };

    // Auto-select
    refs.autoTacticsBtn.onclick = () => {
      hideTacticsModal();
      onConfirm({
        batting: bestBat.id,
        powerplay: bestPP.id,
        middle: bestMid.id,
        death: bestDth.id,
        field: bestFld.id,
        captaincy: bestCap.id,
      });
    };
  }

  function updateTacticAdvisor(pitch) {
    if (!pendingTactics) return;
    const bat  = BATTING_TACTICS.find((t) => t.id === pendingTactics.batting);
    const pp   = POWERPLAY_TACTICS.find((t) => t.id === pendingTactics.powerplay);
    const mid  = MIDDLE_TACTICS.find((t) => t.id === pendingTactics.middle);
    const dth  = DEATH_TACTICS.find((t) => t.id === pendingTactics.death);
    const fld  = FIELD_SETTINGS.find((t) => t.id === pendingTactics.field);
    const cap  = CAPTAINCY_TACTICS.find((t) => t.id === pendingTactics.captaincy);
    const total = (bat?.pitchFit[pitch.id] ?? 0) + (pp?.pitchFit[pitch.id] ?? 0) +
                  (mid?.pitchFit[pitch.id] ?? 0) + (dth?.pitchFit[pitch.id] ?? 0) +
                  (fld?.pitchFit[pitch.id] ?? 0) + (cap?.pitchFit[pitch.id] ?? 0);
    const advice = total >= 3   ? "Masterclass setup — every tactic nails the conditions."
                 : total >= 1.5 ? "Strong plan — most tactics fit the pitch well."
                 : total >= 0   ? "Decent setup. A few calls might be off."
                 : total > -2   ? "Mixed alignment. The pitch will test your choices."
                 : "Risky plan — conditions are working against you.";
    refs.tacticAdvisor.textContent = advice;
    refs.tacticAdvisor.style.color = total >= 3 ? "var(--positive)" : total < -2 ? "var(--danger)" : "";
  }

  function hideTacticsModal() {
    refs.tacticsModal.classList.remove("visible");
    refs.tacticsModal.setAttribute("aria-hidden", "true");
  }

  // ── Live Match Animation ───────────────────────────────────────────────────

  function showLiveMatch(result, fixture, onClose) {
    const homeTeam = getTeamById(fixture.homeId);
    const awayTeam = getTeamById(fixture.awayId);
    const pitch    = result.pitch ?? PITCH_TYPES[0];

    refs.liveMatchPhaseLabel.textContent = fixture.phase;
    refs.liveMatchTitle.textContent      = `${homeTeam.short} vs ${awayTeam.short}`;
    refs.livePitchBadge.textContent      = `${pitch.emoji} ${pitch.label}`;
    refs.livePitchBadge.dataset.type     = pitch.id;
    refs.livePitchDesc.textContent       = pitch.description;

    // Identify which innings is which team
    const firstTeam  = getTeamById(result.firstBattingId);
    const secondTeam = result.firstBattingId === fixture.homeId ? awayTeam : homeTeam;
    const inn1       = result.innings1;
    const inn2       = result.innings2;

    // Reset blocks
    [refs.inningsBlock1, refs.inningsBlock2, refs.liveResultBlock].forEach((el) => {
      el.classList.remove("revealed");
    });
    refs.innings1Label.textContent = `${firstTeam.short} — 1st Innings`;
    refs.innings2Label.textContent = `${secondTeam.short} — 2nd Innings (chasing ${inn1.score + 1})`;
    refs.innings1Total.textContent = "--";
    refs.innings2Total.textContent = "--";
    refs.innings1Best.textContent  = "";
    refs.innings2Best.textContent  = "";
    refs.phaseBars1.innerHTML = buildPhaseBarsHTML(inn1.phases);
    refs.phaseBars2.innerHTML = buildPhaseBarsHTML(inn2.phases);
    refs.liveCommentary.innerHTML  = "";
    refs.liveResultBlock.innerHTML = "";
    refs.closeLiveMatchBtn.classList.add("hidden");

    liveMatchCallback = onClose;
    refs.liveMatchModal.classList.add("visible");
    refs.liveMatchModal.setAttribute("aria-hidden", "false");

    // Animate step by step
    setTimeout(() => revealInnings(1, inn1, result, fixture, () => {
      setTimeout(() => revealInnings(2, inn2, result, fixture, () => {
        setTimeout(() => revealResult(result, fixture), 400);
      }), 500);
    }), 300);
  }

  function buildPhaseBarsHTML(phases) {
    const MAX_RUNS = 85;
    return phases.map((ph) => {
      const pct = Math.round(Math.min(100, (ph.runs / MAX_RUNS) * 100));
      const cls = ph.label === "Powerplay" ? "powerplay" : ph.label === "Middle" ? "middle" : "death";
      return `<div class="phase-bar-item">
        <span class="phase-bar-label">${ph.label} (${ph.wickets}wk)</span>
        <div class="phase-bar-track">
          <div class="phase-bar-fill ${cls}" style="width:0%" data-target="${pct}%"></div>
        </div>
        <span class="phase-bar-score">${ph.runs} runs</span>
      </div>`;
    }).join("");
  }

  function revealInnings(num, innings, result, fixture, onDone) {
    const block     = num === 1 ? refs.inningsBlock1 : refs.inningsBlock2;
    const totalEl   = num === 1 ? refs.innings1Total : refs.innings2Total;
    const bestEl    = num === 1 ? refs.innings1Best  : refs.innings2Best;
    const barsEl    = num === 1 ? refs.phaseBars1    : refs.phaseBars2;
    const teamId    = num === 1 ? result.firstBattingId
                                : (result.firstBattingId === fixture.homeId ? fixture.awayId : fixture.homeId);
    const isUser    = teamId === state.userFranchiseId;

    block.classList.add("revealed");

    // Animate bars with staggered delay
    barsEl.querySelectorAll(".phase-bar-fill").forEach((fill, i) => {
      setTimeout(() => {
        fill.style.width = fill.dataset.target;
      }, i * 220);
    });

    // Score pop after bars finish
    setTimeout(() => {
      // Determine which score belongs to this innings team
      const homeIsFirst = result.firstBattingId === fixture.homeId;
      const score = num === 1
        ? (homeIsFirst ? result.homeScore : result.awayScore)
        : (homeIsFirst ? result.awayScore : result.homeScore);

      totalEl.textContent = score;
      totalEl.classList.add("pop");
      setTimeout(() => totalEl.classList.remove("pop"), 400);

      const topBat = num === 1 ? result.innings1?.topScorer : result.innings2?.topScorer;
      const topBwl = num === 1 ? result.innings1?.topWicketTaker : result.innings2?.topWicketTaker;
      const parts  = [topBat ? `${topBat}*` : null, topBwl ? `${topBwl}` : null].filter(Boolean);
      bestEl.textContent = parts.join("  |  ");

      // Commentary line
      const phases = innings.phases;
      const ppGood = phases[0].runs >= 45;
      const midGood = phases[1].runs >= 70;
      const dtGood  = phases[2].runs >= 45;
      const lines = [
        ppGood  ? pickRandom(COMMENTARY.powerplayGood)  : pickRandom(COMMENTARY.powerplayBad),
        midGood ? pickRandom(COMMENTARY.middleGood)     : pickRandom(COMMENTARY.middleBad),
        dtGood  ? pickRandom(COMMENTARY.deathGood)      : pickRandom(COMMENTARY.deathBad),
      ];
      lines.forEach((line, i) => {
        setTimeout(() => addCommentaryLine(line, isUser), i * 280);
      });

      setTimeout(onDone, 900);
    }, 750);
  }

  function revealResult(result, fixture) {
    const userWon = result.winnerId === state.userFranchiseId;
    const userInvolved = fixture.homeId === state.userFranchiseId || fixture.awayId === state.userFranchiseId;

    const winnerName = getTeamById(result.winnerId).name;
    const loserName  = getTeamById(result.loserId).name;

    refs.liveResultBlock.innerHTML = `
      <p class="live-result-text${userInvolved ? (userWon ? "" : " loss") : ""}" id="liveResultText">
        ${winnerName} beat ${loserName} by ${result.margin}
      </p>
      <p class="live-pom-text" id="livePomText">🏅 Player of the Match: ${result.playerOfMatch}</p>
      <div class="tactic-feedback" id="tacticFeedback">
        ${(result.tacticChips ?? []).map((c) =>
          `<span class="tactic-chip ${c.type}">${c.label}</span>`
        ).join("")}
      </div>
    `;
    refs.liveResultBlock.classList.add("revealed");

    if (userInvolved) {
      const chase  = result.innings2.score > result.innings1.score;
      const tight  = Math.abs(result.innings1.score - result.innings2.score) <= 8;
      const line   = tight ? pickRandom(COMMENTARY.chaseTight)
                   : chase ? pickRandom(COMMENTARY.chaseComfort)
                   : "";
      if (line) addCommentaryLine(line, true);

      const hasGoodChips = (result.tacticChips ?? []).some((c) => c.type === "win");
      const hasBadChips  = (result.tacticChips ?? []).some((c) => c.type === "loss");
      if (hasGoodChips) addCommentaryLine(pickRandom(COMMENTARY.tacticsWin), true);
      else if (hasBadChips) addCommentaryLine(pickRandom(COMMENTARY.tacticsMiss), false);
    }

    setTimeout(() => {
      refs.closeLiveMatchBtn.classList.remove("hidden");
    }, 600);
  }

  function addCommentaryLine(text, highlight = false) {
    const el = document.createElement("p");
    el.className = `commentary-line${highlight ? " highlight" : ""}`;
    el.textContent = text;
    refs.liveCommentary.prepend(el);
  }

  function pickRandom(arr) {
    return arr[Math.floor(nextRandom() * arr.length)] ?? arr[0];
  }

  function hideLiveMatchModal() {
    refs.liveMatchModal.classList.remove("visible");
    refs.liveMatchModal.setAttribute("aria-hidden", "true");
    const cb = liveMatchCallback;
    liveMatchCallback = null;
    if (cb) cb();
  }

  // ── Sim Next with tactics flow ────────────────────────────────────────────

  function simulateNextMatchWithTactics() {
    if (!state || state.season.status === "locked" || state.season.status === "complete") return;

    // Ensure playoffs are seeded if needed
    if (state.season.currentFixtureIndex >= state.season.fixtures.length) {
      seedPlayoffsIfNeeded();
      render(); persistState(); return;
    }

    const fixture = state.season.fixtures[state.season.currentFixtureIndex];
    if (!fixture) return;

    const userInvolved = fixture.homeId === state.userFranchiseId || fixture.awayId === state.userFranchiseId;

    if (userInvolved) {
      // Generate pitch early so tactics modal shows it
      if (!fixture.pitch) fixture.pitch = generateMatchPitch();

      showTacticsModal(fixture, (tactics) => {
        // Simulate with chosen tactics
        let result;
        try {
          result = simulateFixture(fixture, tactics);
        } catch (err) {
          console.error(err);
          addLog("Match simulation error.", "danger");
          state.season.currentFixtureIndex += 1;
          render(); persistState(); return;
        }

        // Commit result to state
        commitFixtureResult(fixture, result);
        render(); persistState();

        // Show animated live match
        showLiveMatch(result, fixture, () => {
          render(); persistState();
          if (state.season.status === "complete") showSeasonAwards();
        });
      });
    } else {
      // Non-user match — just simulate normally
      const played = playOneFixture(null);
      if (played) {
        render(); persistState();
        if (state.season.status === "complete") showSeasonAwards();
      }
    }
  }

  /** Write the result of a simulated fixture into game state (extracted from playOneFixture). */
  function commitFixtureResult(fixture, result) {
    fixture.played = true;
    fixture.result = result;

    state.season.recentMatches.unshift(buildMatchEntry(fixture, result));
    state.season.recentMatches = state.season.recentMatches.slice(0, 12);

    trackMatchStats(result);

    if (fixture.phase === "League") {
      updateLeagueTable(fixture, result);
    } else {
      ensureNextPlayoffFixture(fixture, result);
    }

    state.season.currentFixtureIndex += 1;
    addLog(result.summary, result.margin.includes("Super Over") ? "warning" : "positive");

    if (state.season.status === "league") seedPlayoffsIfNeeded();
  }

  // ── Orange/Purple Cap + Season Awards ─────────────────────────────────────

  function getCapLeaders() {
    const entries = Object.entries(state.seasonStats);
    let orangeCap = null;
    let purpleCap = null;
    let mvp = null;

    for (const [playerId, stats] of entries) {
      const player = state.players.find((p) => p.id === playerId);
      if (!player) continue;
      const teamId = state.franchises.find((t) => t.squad.includes(playerId))?.id;
      const team = teamId ? getTeamById(teamId) : null;

      if ((stats.runs ?? 0) > 0 && (!orangeCap || stats.runs > orangeCap.runs)) {
        orangeCap = { player, team, runs: stats.runs, matches: stats.matches ?? 0 };
      }
      if ((stats.wickets ?? 0) > 0 && (!purpleCap || stats.wickets > purpleCap.wickets)) {
        purpleCap = { player, team, wickets: stats.wickets };
      }
      if ((stats.pomAwards ?? 0) > 0 && (!mvp || stats.pomAwards > mvp.pomAwards)) {
        mvp = { player, team, pomAwards: stats.pomAwards };
      }
    }
    return { orangeCap, purpleCap, mvp };
  }

  function showSeasonAwards() {
    refs.seasonAwardsContent.classList.remove("scorecard-panel");
    const champ = state.season.championId ? getTeamById(state.season.championId) : null;
    const caps = getCapLeaders();
    const seasonNum = state.seasonNumber ?? 1;
    const userTeam = getTeamById(state.userFranchiseId);
    const userEntry = state.season.table[state.userFranchiseId];
    const userWon = state.season.championId === state.userFranchiseId;

    const awards = [];
    awards.push({
      icon: "🏆",
      label: "Champion",
      value: champ ? champ.name : "TBD",
      color: champ?.colors?.primary ?? "#FFD700",
      highlight: userWon,
    });
    if (caps.orangeCap) {
      awards.push({
        icon: "🧡",
        label: "Orange Cap",
        value: `${caps.orangeCap.player.name} — ${caps.orangeCap.runs} runs`,
        color: "#FF6B00",
      });
    }
    if (caps.purpleCap) {
      awards.push({
        icon: "💜",
        label: "Purple Cap",
        value: `${caps.purpleCap.player.name} — ${caps.purpleCap.wickets} wkts`,
        color: "#8B5CF6",
      });
    }
    if (caps.mvp) {
      awards.push({
        icon: "🌟",
        label: "MVP",
        value: `${caps.mvp.player.name} — ${caps.mvp.pomAwards} POM`,
        color: "#FBBF24",
      });
    }

    const awardsHTML = awards.map((a) => `
      <div class="award-card${a.highlight ? " champion-glow" : ""}" style="--award-color: ${a.color}">
        <span class="award-icon">${a.icon}</span>
        <span class="award-label">${a.label}</span>
        <span class="award-value">${a.value}</span>
      </div>
    `).join("");

    const userSummary = userWon
      ? `Congratulations! ${userTeam.name} are IPL Season ${seasonNum} Champions!`
      : `${userTeam.name} finished with ${userEntry.points} pts (NRR ${userEntry.nrr.toFixed(2)}).`;

    refs.seasonAwardsContent.innerHTML = `
      <h2 class="awards-title">Season ${seasonNum} Awards</h2>
      <p class="awards-user-summary${userWon ? " champion-text" : ""}">${userSummary}</p>
      <div class="awards-grid">${awardsHTML}</div>
      <div class="awards-actions">
        <button id="newSeasonBtn" class="button button-primary">Retention & Next Season</button>
        <button id="dismissAwardsBtn" class="button button-secondary">Close</button>
      </div>
    `;

    refs.seasonAwardsModal.classList.add("visible");
    refs.seasonAwardsModal.setAttribute("aria-hidden", "false");

    document.getElementById("dismissAwardsBtn").addEventListener("click", () => {
      refs.seasonAwardsModal.classList.remove("visible");
      refs.seasonAwardsModal.setAttribute("aria-hidden", "true");
    }, { once: true });
    document.getElementById("newSeasonBtn").addEventListener("click", () => {
      openRetentionCenter();
    }, { once: true });
  }

  // ── Multi-Season Support ────────────────────────────────────────────────────

  function getRetentionCost(player) {
    return roundPrice(Math.max(player.basePrice, player.marketValue * 0.55));
  }

  function getExpiringPlayers(team) {
    return team.squad
      .map((id) => {
        const player = getPlayerById(id);
        const years = team.contracts?.[id] ?? 1;
        return player ? { player, years } : null;
      })
      .filter(Boolean)
      .filter((entry) => entry.years <= 1);
  }

  function openRetentionCenter() {
    if (!state || state.season.status !== "complete") return;
    refs.seasonAwardsContent.classList.remove("scorecard-panel");
    const userTeam = getUserTeam();
    const userExpiring = getExpiringPlayers(userTeam);
    const maxRetentions = 3;

    if (!userExpiring.length) {
      startNewSeason([]);
      return;
    }

    const rows = userExpiring.map(({ player }) => {
      const cost = getRetentionCost(player);
      return `<label class="retention-row">
        <input type="checkbox" class="retention-check" value="${player.id}" />
        <span>${player.name} · ${formatRole(player.role)}</span>
        <strong>${formatCrore(cost)}</strong>
      </label>`;
    }).join("");

    refs.seasonAwardsContent.innerHTML = `
      <h2 class="awards-title">Retention Center</h2>
      <p class="awards-user-summary">Choose up to ${maxRetentions} expiring players to retain for 2 years.</p>
      <div class="retention-list">${rows}</div>
      <div class="awards-actions">
        <button id="confirmRetentionBtn" class="button button-primary">Confirm Retentions</button>
        <button id="skipRetentionBtn" class="button button-secondary">Skip Retention</button>
      </div>
    `;
    refs.seasonAwardsModal.classList.add("visible");
    refs.seasonAwardsModal.setAttribute("aria-hidden", "false");

    const checks = () => Array.from(document.querySelectorAll(".retention-check"));
    document.getElementById("confirmRetentionBtn")?.addEventListener("click", () => {
      const picked = checks().filter((c) => c.checked).map((c) => c.value).slice(0, maxRetentions);
      startNewSeason(picked);
    }, { once: true });
    document.getElementById("skipRetentionBtn")?.addEventListener("click", () => {
      startNewSeason([]);
    }, { once: true });
    checks().forEach((box) => {
      box.addEventListener("change", () => {
        const selected = checks().filter((c) => c.checked);
        if (selected.length > maxRetentions) box.checked = false;
      });
    });
  }

  function startNewSeason(userRetainIds = []) {
    if (!state || state.season.status !== "complete") return;

    const currentSeasonNum = state.seasonNumber ?? 1;

    // Archive current season
    state.seasonHistory.push({
      seasonNumber: currentSeasonNum,
      championId: state.season.championId,
      table: JSON.parse(JSON.stringify(state.season.table)),
      caps: getCapLeaders(),
      userPoints: state.season.table[state.userFranchiseId]?.points ?? 0,
    });

    // Reset purse for new-year cap sheet
    state.franchises.forEach((team) => {
      team.purse = SETTINGS.initialPurse;
      team.spent = 0;
    });

    const releasedIds = [];
    const userRetainSet = new Set(userRetainIds);

    // Apply contracts, retention, and release lists
    for (const team of state.franchises) {
      const isUser = team.id === state.userFranchiseId;
      const expiring = getExpiringPlayers(team).map((e) => e.player.id);
      const aiRetainSet = new Set(
        expiring
          .map((id) => getPlayerById(id))
          .filter(Boolean)
          .sort((a, b) => (b.batting + b.bowling * 0.9 + b.temperament * 0.2) - (a.batting + a.bowling * 0.9 + a.temperament * 0.2))
          .slice(0, 2)
          .map((p) => p.id)
      );

      const newSquad = [];
      const newContracts = {};
      for (const playerId of team.squad) {
        const currentYears = team.contracts?.[playerId] ?? 1;
        const nextYears = currentYears - 1;
        const player = getPlayerById(playerId);
        if (!player) continue;
        const shouldRetain = nextYears <= 0 && (
          isUser ? userRetainSet.has(playerId) : aiRetainSet.has(playerId)
        );

        if (nextYears > 0) {
          newSquad.push(playerId);
          newContracts[playerId] = nextYears;
          continue;
        }
        if (shouldRetain) {
          const retainCost = getRetentionCost(player);
          if (team.purse >= retainCost) {
            team.purse = roundPrice(team.purse - retainCost);
            team.spent = roundPrice(team.spent + retainCost);
            newSquad.push(playerId);
            newContracts[playerId] = 2;
            continue;
          }
        }
        releasedIds.push(playerId);
      }
      team.squad = newSquad;
      team.contracts = newContracts;
    }

    // Update player statuses after releases
    const contracted = new Set(state.franchises.flatMap((team) => team.squad));
    state.players.forEach((p) => {
      p.status = contracted.has(p.id) ? "sold" : "available";
    });

    state.seasonNumber = currentSeasonNum + 1;
    state.season = createSeasonState();
    state.seasonStats = {};
    state.auction.status = "running";
    state.auction.lotNumber = 0;
    state.auction.currentLot = null;
    state.auction.queueIndex = 0;
    state.auction.acceleratedPhase = false;
    state.auction.proxy = null;
    state.auction.soldLots = [];
    state.auction.queue = generateAuctionQueue(state.players.filter((p) => p.status === "available"));
    state.auctionIntel = { scoutedTeamId: null, revealUntilLot: 0, scansUsed: 0 };

    if (state.auction.queue.length) {
      startNextLot();
      addLog(
        `Season ${state.seasonNumber} offseason opened. ${releasedIds.length} players released to auction after contract expiry.`,
        "warning"
      );
    } else {
      initializeSeason();
      addLog(`Season ${state.seasonNumber} begins. No free agents entered offseason auction.`, "positive");
    }

    refs.seasonAwardsModal.classList.remove("visible");
    refs.seasonAwardsModal.setAttribute("aria-hidden", "true");
    render();
    persistState();
  }

  let statsTab = "batting";
  let statsSortKey = "runs";
  let statsSortDir = -1; // -1 = descending

  function render() {
    renderTopBar();
    renderSpotlight();
    renderLog();
    renderRivals();
    renderUserPanel();
    renderLeaderboard();
    renderSeason();
    renderScenarioPanel();
    renderStats();
    renderControls();
    renderClock();
  }

  function renderTopBar() {
    refs.auctionPhase.textContent = getAuctionPhaseLabel();
    refs.lotIndicator.textContent = state
      ? `${state.auction.lotNumber} / ${state.players.length}`
      : "0 / 0";
    refs.marketPulse.textContent = getMarketPulseText();
    refs.saveStatus.textContent = formatTimeStamp(state?.lastSavedAt);
    refs.seasonStatus.textContent = getSeasonStatusText();
  }

  function renderSpotlight() {
    const player = getCurrentPlayer();
    const lot = getCurrentLot();
    const userTeam = getUserTeam();

    if (!state || !player || !lot) {
      refs.playerName.textContent = "Launch a campaign to enter the room";
      refs.playerRoleBadge.textContent = "Auction idle";
      refs.playerRoleBadge.className = "pill neutral";
      refs.playerNationBadge.textContent = "Local save only";
      refs.playerNationBadge.className = "pill neutral";
      refs.playerMeta.textContent =
        state?.season.status && state.season.status !== "locked"
          ? "Auction complete. The season engine is now active."
          : "Pick a franchise to begin your auction campaign.";
      refs.playerTags.innerHTML = "";
      if (refs.statBars) refs.statBars.innerHTML = "";
      if (refs.playerPortrait) refs.playerPortrait.textContent = "";
      if (refs.playerCard) refs.playerCard.classList.remove("marquee-player");
      refs.currentBid.textContent = "--";
      refs.leadingTeam.textContent = "No bids";
      refs.fairValue.textContent = "--";
      refs.nextIncrement.textContent = "--";
      refs.marketRead.textContent = "Market read will unlock when the first lot opens.";
      refs.bidAdvice.textContent =
        state?.season.status === "locked"
          ? "Discipline matters more than impulse. Every price should fit your squad plan."
          : "Season mode is live. Use the simulator buttons to play through league fixtures and playoffs.";
      refs.nominationReason.textContent =
        state?.season.status === "locked"
          ? "Rival nomination logic appears here once the auction opens."
          : "The auction is complete. Season results and points table are active below.";
      return;
    }

    const roleIcon = { WK: "🧤", BAT: "🏏", AR: "⚡", BWL: "🎯" }[player.role] || "🏏";
    if (refs.playerPortrait) refs.playerPortrait.textContent = hasTag(player, "marquee") ? "🌟" : roleIcon;
    if (refs.playerCard) refs.playerCard.classList.toggle("marquee-player", hasTag(player, "marquee"));

    refs.playerName.textContent = player.name;
    refs.playerRoleBadge.textContent = `${formatRole(player.role)} · ${player.style}`;
    refs.playerRoleBadge.className = "pill";
    refs.playerNationBadge.textContent = player.overseas ? "Overseas" : "Domestic";
    refs.playerNationBadge.className = `pill ${player.overseas ? "overseas" : "domestic"}`;
    refs.playerMeta.textContent = `${player.originTeam} · Age ${player.age} · Fair ${formatCrore(
      player.marketValue
    )} · Base ${formatCrore(player.basePrice)}`;
    refs.playerTags.innerHTML = player.tags
      .slice(0, 6)
      .map((tag) => `<span class="tag-chip">${tag}</span>`)
      .join("");

    const statDefs = [
      { label: "Batting",     value: player.batting,     color: "#7ddc8e" },
      { label: "Bowling",     value: player.bowling,     color: "#ffb866" },
      { label: "Fielding",    value: player.fielding,    color: "#41c4d9" },
      { label: "Temperament", value: player.temperament, color: "#c788ff" },
    ];
    if (refs.statBars) refs.statBars.innerHTML = statDefs.map((s) => `
      <div class="stat-bar-row">
        <span class="stat-bar-label">${s.label}</span>
        <div class="stat-bar-track">
          <div class="stat-bar-fill" style="width:${s.value}%;background:${s.color}"></div>
        </div>
        <span class="stat-bar-value">${s.value}</span>
      </div>
    `).join("");
    refs.currentBid.textContent = formatCrore(lot.currentBid);
    refs.leadingTeam.textContent = lot.leadingBidderId
      ? getTeamById(lot.leadingBidderId).name
      : "No bids";
    refs.fairValue.textContent = userTeam ? formatCrore(calculateTeamValuation(userTeam, player)) : "--";
    refs.nextIncrement.textContent = formatCrore(getNextBidValue());
    refs.marketRead.textContent = getMarketRead(player);
    refs.bidAdvice.textContent = getBidAdvice(player);
    refs.nominationReason.textContent = lot.reason;
  }

  function renderClock() {
    const lot = getCurrentLot();
    if (!state || !lot) {
      refs.clockText.textContent = "0.0s";
      refs.timerFill.style.width = "0%";
      refs.timerFill.classList.remove("pulse");
      return;
    }

    const ratio = Math.max(0, lot.timer / Math.max(0.1, lot.maxTimer));
    refs.clockText.textContent = `${lot.timer.toFixed(1)}s`;
    refs.timerFill.style.width = `${Math.max(0, Math.min(100, ratio * 100))}%`;
    refs.timerFill.classList.toggle("pulse", ratio < 0.3);
  }

  function renderControls() {
    const lot = getCurrentLot();
    const userTeam = getUserTeam();
    const auctionActive = Boolean(state) && state.auction.status !== "complete";
    const canBid =
      Boolean(
        state &&
          lot &&
          userTeam &&
          canTeamBid(userTeam, getCurrentPlayer(), getNextBidValue())
      ) && state.auction.status === "running";

    refs.bidButton.disabled = !canBid;
    refs.undoBidBtn.disabled =
      !undoBidSnapshot ||
      !getCurrentLot() ||
      undoBidSnapshot.playerId !== getCurrentLot()?.playerId;
    // Skip: allowed only when auction is running, no bid placed, and not in accelerated phase
    const canSkip =
      Boolean(state && lot && state.auction.status === "running") &&
      !lot.leadingBidderId &&
      !state.auction.acceleratedPhase;
    refs.skipPlayerBtn.disabled = !canSkip;
    refs.pauseBtn.disabled = !state || state.auction.status === "complete";
    refs.simAuctionBtn.disabled = !auctionActive;
    refs.pauseBtn.textContent =
      state?.auction.status === "paused" ? "Resume Auction" : "Pause Auction";
    refs.setProxyBtn.disabled = !lot || state.auction.status !== "running";
    refs.clearProxyBtn.disabled = !state?.auction.proxy;
    refs.simNextBtn.disabled = !state || state.season.status === "locked" || state.season.status === "complete";
    refs.simRoundBtn.disabled = !state || state.season.status === "locked" || state.season.status === "complete";
    refs.simSeasonBtn.disabled = !state || state.season.status === "locked" || state.season.status === "complete";
    if (refs.scoutRivalBtn) {
      refs.scoutRivalBtn.disabled = !state || state.auction.status !== "running" || (getUserTeam()?.purse ?? 0) < 0.2;
    }
    if (refs.runScenarioBtn) {
      refs.runScenarioBtn.disabled = !state || state.season.status === "locked";
    }
  }

  function renderLog() {
    if (!state || state.logs.length === 0) {
      refs.auctionLog.innerHTML = '<p class="empty-state">Auction log is waiting for the first lot.</p>';
      return;
    }

    refs.auctionLog.innerHTML = state.logs
      .map(
        (entry) => `
          <article class="log-entry ${entry.tone}">
            <span class="log-meta">Lot ${entry.lot || "-"}</span>
            <strong>${entry.message}</strong>
          </article>
        `
      )
      .join("");
  }

  function renderRivals() {
    const entries = getRivalHeatEntries();
    if (refs.scoutRivalBtn && state?.auctionIntel) {
      const lotsLeft = Math.max(0, (state.auctionIntel.revealUntilLot || 0) - (state.auction.lotNumber || 0));
      refs.scoutRivalBtn.textContent = lotsLeft > 0
        ? `Scout Rival (active ${lotsLeft} lots)`
        : "Scout Rival (0.20 cr)";
    }
    if (!entries.length) {
      refs.rivalBoard.innerHTML =
        '<p class="empty-state">Rival pressure appears once the auction starts.</p>';
      return;
    }

    refs.rivalBoard.innerHTML = entries
      .map((entry) => {
        const intel = state.auctionIntel || {};
        const revealActive = state.auction.status === "complete" ||
          (intel.scoutedTeamId === entry.team.id && (state.auction.lotNumber || 0) <= (intel.revealUntilLot || 0));
        const fogMeta = revealActive
          ? `${entry.status} · Need ${entry.pressure.toFixed(1)} · Walk ${formatCrore(entry.valuation)}`
          : `Intel Fog · Need ${formatNeedBand(entry.pressure)} · Walk ${formatCrore(Math.max(0.2, Math.round(entry.valuation)))}±`;
        const heatColor =
          entry.heat > 7 ? "var(--danger)" : entry.heat > 4 ? "var(--warning)" : "var(--positive)";
        const heatShown = revealActive ? entry.heat : clamp(entry.heat * 0.62 + 1.4, 2.4, 7.2);
        const heatPct = Math.min(100, (heatShown / 10) * 100).toFixed(1);
        const franchise = state.franchises.find((f) => f.id === entry.team.id);
        const badgeColor = franchise?.colors.primary || "#888888";
        return `
          <article class="rival-entry">
            <div class="team-badge" style="background:${badgeColor}22;border-color:${badgeColor}55;color:${badgeColor}">${entry.team.short}</div>
            <div class="rival-info">
              <strong class="rival-name">${entry.team.name}</strong>
              <span class="rival-meta">${fogMeta}</span>
              <div class="rival-heat-bar">
                <div class="rival-heat-fill" style="width:${heatPct}%;background:${heatColor}"></div>
              </div>
            </div>
            <strong class="rival-score" style="color:${heatColor}">${revealActive ? entry.heat.toFixed(1) : "??"}</strong>
          </article>
        `;
      })
      .join("");
  }

  function renderUserPanel() {
    const userTeam = getUserTeam();
    if (!state || !userTeam) {
      refs.userFranchiseName.textContent = "Choose a team";
      refs.userStrategy.textContent = "No strategy loaded";
      refs.userStrategy.className = "pill neutral";
      refs.userPurse.textContent = "0.00 cr";
      refs.slotsLeft.textContent = "0";
      refs.proxyStatus.textContent = "Off";
      refs.needsGrid.innerHTML = '<p class="empty-state">Your roster dashboard appears after setup.</p>';
      refs.userSquad.innerHTML = '<p class="empty-state">No players bought yet.</p>';
      return;
    }

    refs.userFranchiseName.textContent = userTeam.name;
    refs.userStrategy.textContent = userTeam.strategyLabel;
    refs.userStrategy.className = "pill";
    refs.userPurse.textContent = formatCrore(userTeam.purse);
    refs.slotsLeft.textContent = String(getSlotsLeft(userTeam));
    refs.proxyStatus.textContent =
      state.auction.proxy && state.auction.currentLot && state.auction.proxy.playerId === state.auction.currentLot.playerId
        ? formatCrore(state.auction.proxy.maxBid)
        : "Off";

    const needs = getNeedSnapshot(userTeam);
    const squadCount = userTeam.squad.length;
    const belowMin = squadCount < SETTINGS.minSquadSize;
    const overseasCount = getOverseasCount(userTeam);
    refs.needsGrid.innerHTML = `
      <article class="need-card">
        <span class="need-label">Squad</span>
        <strong class="${belowMin ? "danger" : "healthy"}">${squadCount} / ${SETTINGS.squadSize}</strong>
        <span class="need-value">${belowMin ? `Min ${SETTINGS.minSquadSize} required` : "OK"}</span>
      </article>
      <article class="need-card">
        <span class="need-label">Overseas</span>
        <strong class="${overseasCount >= SETTINGS.maxOverseas ? "warning" : "healthy"}">${overseasCount} / ${SETTINGS.maxOverseas}</strong>
        <span class="need-value">${overseasCount >= SETTINGS.maxOverseas ? "Full" : `${SETTINGS.maxOverseas - overseasCount} left`}</span>
      </article>
    ` + NEED_DEFINITIONS.map((need) => {
      const item = needs[need.id];
      const tone = item.deficit === 0 ? "healthy" : item.deficit === 1 ? "warning" : "danger";
      return `
        <article class="need-card">
          <span class="need-label">${item.label}</span>
          <strong class="${tone}">${item.current} / ${item.target}</strong>
          <span class="need-value">${item.deficit === 0 ? "Covered" : `${item.deficit} short`}</span>
        </article>
      `;
    }).join("");

    const squadPlayers = getTeamPlayers(userTeam)
      .map((player) => {
        const sale = state.auction.soldLots.find(
          (lot) => lot.playerId === player.id && lot.teamId === userTeam.id
        );
        return { player, price: sale?.price || player.basePrice };
      })
      .sort((left, right) => right.price - left.price);

    const roleColors = { WK: "#ffd700", BAT: "#7ddc8e", AR: "#4aaeff", BWL: "#ffb866" };
    refs.userSquad.innerHTML = squadPlayers.length
      ? squadPlayers
          .map(({ player, price }) => {
            const pom = state.seasonStats?.[player.id]?.pomAwards || 0;
            const rc = roleColors[player.role] || "#888";
            const years = userTeam.contracts?.[player.id] ?? 1;
            return `
              <article class="squad-entry">
                <div class="squad-entry-info">
                  <strong class="squad-name">${player.name}${pom > 0 ? ` <span class="pom-star">★${pom}</span>` : ""}</strong>
                  <span class="squad-meta">${player.originTeam} · ${player.overseas ? "🌐 Overseas" : "🇮🇳 Domestic"} · Contract ${years}y</span>
                </div>
                <div class="squad-right">
                  <span class="role-badge" style="color:${rc};background:${rc}1a">${formatRole(player.role)}</span>
                  <strong class="squad-price">${formatCrore(price)}</strong>
                </div>
              </article>
            `;
          })
          .join("")
      : '<p class="empty-state">No players bought yet.</p>';
  }

  function renderLeaderboard() {
    const entries = getLeaderboardEntries();
    if (!entries.length) {
      refs.leaderboard.innerHTML =
        '<p class="empty-state">Power rankings appear after launch.</p>';
      return;
    }

    refs.leaderboard.innerHTML = entries
      .map((entry, index) => {
        const franchise = state.franchises.find((f) => f.id === entry.team.id);
        const color = franchise?.colors.primary || "#888888";
        const oddsPct = Math.min(100, entry.odds).toFixed(1);
        const medalClass = index === 0 ? "gold" : index === 1 ? "silver" : index === 2 ? "bronze" : "";
        return `
          <article class="leader-entry" style="--team-color:${color};--odds-pct:${oddsPct}%">
            <div class="team-badge ${medalClass}" style="background:${color}22;border-color:${color}55;color:${color}">${entry.team.short}</div>
            <div>
              <strong class="leader-name">${entry.team.name}</strong>
              <span class="leader-meta">${entry.team.squad.length}/${SETTINGS.squadSize} players · ${formatCrore(entry.team.purse)} left</span>
            </div>
            <div class="odds-block">
              <strong style="color:${color}">${entry.odds.toFixed(1)}%</strong>
              <div class="odds-bar-track">
                <div class="odds-bar-fill" style="width:${oddsPct}%;background:${color}"></div>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderSeason() {
    if (!state || state.season.status === "locked") {
      refs.seasonSummary.innerHTML =
        "Finish the auction to unlock the season schedule and points table.";
      refs.recentMatches.innerHTML =
        '<p class="empty-state">Season simulation appears after the auction ends.</p>';
      refs.pointsTable.innerHTML =
        '<p class="empty-state">Points table will appear once league fixtures begin.</p>';
      return;
    }

    const nextFixture = state.season.fixtures[state.season.currentFixtureIndex];
    const userEntry = state.season.table[state.userFranchiseId];
    const seasonNum = state.seasonNumber ?? 1;
    const caps = getCapLeaders();

    // Season summary with cap leaders
    let summaryHTML = "";
    if (state.season.status === "complete") {
      const champTeam = getTeamById(state.season.championId);
      summaryHTML = champTeam
        ? `<strong>🏆 ${champTeam.name}</strong> won Season ${seasonNum}. Your team: ${userEntry.points} pts, NRR ${userEntry.nrr.toFixed(2)}.`
        : `Season ${seasonNum} complete. Your team: ${userEntry.points} pts, NRR ${userEntry.nrr.toFixed(2)}.`;
    } else if (nextFixture) {
      summaryHTML = `<strong>${nextFixture.phase}:</strong> ${getTeamById(nextFixture.homeId).short} vs ${getTeamById(nextFixture.awayId).short}. Your franchise: ${userEntry.points} pts, NRR ${userEntry.nrr.toFixed(2)}.`;
    } else {
      summaryHTML = "Season bracket is updating.";
    }

    // Cap leader badges
    const capBadges = [];
    if (caps.orangeCap) {
      capBadges.push(`<span class="cap-badge orange-cap">🧡 ${caps.orangeCap.player.name} — ${caps.orangeCap.runs} runs</span>`);
    }
    if (caps.purpleCap) {
      capBadges.push(`<span class="cap-badge purple-cap">💜 ${caps.purpleCap.player.name} — ${caps.purpleCap.wickets} wkts</span>`);
    }
    if (caps.mvp) {
      capBadges.push(`<span class="cap-badge mvp-cap">🌟 ${caps.mvp.player.name} — ${caps.mvp.pomAwards} POM</span>`);
    }

    refs.seasonSummary.innerHTML = summaryHTML
      + (capBadges.length ? `<div class="cap-leaders">${capBadges.join("")}</div>` : "");

    refs.recentMatches.innerHTML = state.season.recentMatches.length
      ? state.season.recentMatches
          .map((match) => {
            const isUser = match.homeId === state.userFranchiseId || match.awayId === state.userFranchiseId;
            const chips = (match.tacticChips ?? []).slice(0, 3)
              .map((c) => `<span class="tactic-chip ${c.type}">${c.label}</span>`).join("");
            const pitchBit = match.pitchLabel
              ? `<span class="pitch-badge" data-type="${match.pitchId}" style="font-size:0.68rem;padding:0.15rem 0.55rem;">${match.pitchLabel}</span>`
              : "";
            const hasCard = match.innings1Scorecard || match.innings2Scorecard;
            return `
              <article class="match-entry${isUser ? " user-match" : ""}" ${hasCard ? `data-match-idx="${state.season.recentMatches.indexOf(match)}"` : ""}>
                <strong>${getTeamById(match.homeId).short} ${match.homeScore} — ${getTeamById(match.awayId).short} ${match.awayScore}</strong>
                <span class="match-meta">${match.phase} · ${match.margin} · POM: ${match.playerOfMatch}</span>
                ${pitchBit || chips ? `<div class="match-tactic-tags">${pitchBit}${chips}</div>` : ""}
                ${hasCard ? '<button class="sc-view-btn">Scorecard</button>' : ""}
              </article>
            `;
          }).join("")
      : '<p class="empty-state">No matches simulated yet.</p>';

    // Wire scorecard buttons
    refs.recentMatches.querySelectorAll(".sc-view-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.closest(".match-entry").dataset.matchIdx, 10);
        if (!isNaN(idx)) showScorecardModal(state.season.recentMatches[idx]);
      }, { once: true });
    });

    // Enhanced points table with team badges and qualification line
    const sorted = getSortedTable();
    refs.pointsTable.innerHTML = sorted
      .map((entry, index) => {
        const team = getTeamById(entry.teamId);
        const isUser = entry.teamId === state.userFranchiseId;
        const qualified = index < 4;
        const color = team.colors?.primary ?? "#888";
        return `
          <article class="table-row${isUser ? " user-row" : ""}${qualified ? " qualified" : ""}${index === 3 ? " cutoff-line" : ""}">
            <div class="table-rank" style="background:${color};color:#fff">${index + 1}</div>
            <div class="table-team-info">
              <strong>${team.short}</strong>
              <span class="table-meta">P${entry.played} W${entry.won} L${entry.lost} Pts <b>${entry.points}</b> NRR ${entry.nrr >= 0 ? "+" : ""}${entry.nrr.toFixed(2)}</span>
            </div>
            ${qualified ? '<span class="qualify-tag">Q</span>' : ""}
          </article>
        `;
      })
      .join("")
      + renderSeasonHistory();
  }

  function renderSeasonHistory() {
    if (!state?.seasonHistory?.length) return "";
    return `
      <div class="season-history">
        <p class="section-kicker" style="margin-top:1rem">Past Seasons</p>
        ${state.seasonHistory.map((s) => {
          const champ = getTeamById(s.championId);
          const oc = s.caps?.orangeCap;
          const pc = s.caps?.purpleCap;
          return `<div class="history-entry">
            <strong>S${s.seasonNumber}: 🏆 ${champ?.short ?? "?"}</strong>
            ${oc ? `<span class="cap-badge orange-cap small">🧡 ${oc.player.name} ${oc.runs}r</span>` : ""}
            ${pc ? `<span class="cap-badge purple-cap small">💜 ${pc.player.name} ${pc.wickets}w</span>` : ""}
          </div>`;
        }).join("")}
      </div>
    `;
  }

  function renderScenarioPanel() {
    if (!refs.scenarioOpponent || !state) return;
    const current = refs.scenarioOpponent.value;
    const options = state.franchises
      .filter((f) => f.id !== state.userFranchiseId)
      .map((f) => `<option value="${f.id}">${f.name}</option>`)
      .join("");
    refs.scenarioOpponent.innerHTML = options || '<option value="">No opponent</option>';
    if (current && refs.scenarioOpponent.querySelector(`option[value="${current}"]`)) {
      refs.scenarioOpponent.value = current;
    }
  }

  function runScenarioMode() {
    if (!state) return;
    const userTeam = getUserTeam();
    const opp = getTeamById(refs.scenarioOpponent?.value);
    const pitch = PITCH_TYPES.find((p) => p.id === refs.scenarioPitch?.value) || PITCH_TYPES[0];
    const runsNeeded = clamp(Number(refs.scenarioRunsNeeded?.value || 0), 1, 120);
    const oversLeft = clamp(Number(refs.scenarioOversLeft?.value || 0), 1, 20);
    const wktsInHand = clamp(Number(refs.scenarioWktsInHand?.value || 0), 1, 10);
    if (!userTeam || !opp) return;

    const userLineup = selectLineup(userTeam);
    const oppLineup = selectLineup(opp);
    const bat = calculateLineupStrength(userTeam, userLineup);
    const bowl = calculateLineupStrength(opp, oppLineup);
    const requiredRR = runsNeeded / oversLeft;

    // Scenario engine: use weighted pitch + pressure + wickets in hand.
    const phaseBias = oversLeft <= 5 ? pitch.deathRR : oversLeft <= 10 ? pitch.middleRR : pitch.powerplayRR;
    const edge = (bat.batting - bowl.bowling) * 0.045 + (wktsInHand - 5) * 0.22 + phaseBias * 0.58;
    const expectedRR = clamp(7 + edge + randomNormal(0, 0.45), 4.2, 15.2);
    const projectedRuns = Math.round(expectedRR * oversLeft);
    const pressurePenalty = Math.max(0, (requiredRR - expectedRR) * oversLeft * 0.28);
    const adjustedRuns = Math.max(0, Math.round(projectedRuns - pressurePenalty));
    const margin = adjustedRuns - runsNeeded;
    const winProb = clamp(50 + margin * 2.3 + (wktsInHand - 5) * 3.1, 3, 97);
    const outcome = margin >= 0 ? `CHASED with ${wktsInHand - Math.max(1, Math.round(oversLeft / 4))} wickets left` : `SHORT by ${Math.abs(margin)} runs`;

    refs.scenarioOutput.innerHTML = `
      <strong>${userTeam.short} vs ${opp.short} · ${pitch.label}</strong><br/>
      Need <b>${runsNeeded}</b> from <b>${oversLeft}</b> overs (RR ${requiredRR.toFixed(2)}).<br/>
      Projected: <b>${adjustedRuns}</b> (${expectedRR.toFixed(2)} rpo) → <b>${outcome}</b>.<br/>
      Win chance: <b>${winProb.toFixed(1)}%</b>.
    `;
  }

  // ── Stats Database ──────────────────────────────────────────────────────────

  function renderStats() {
    if (!state || !refs.statsTableWrap) return;
    const seasonActive = state.season?.status && state.season.status !== "locked";
    if (!seasonActive || Object.keys(state.seasonStats).length === 0) {
      refs.statsTableWrap.innerHTML = '<p class="muted-text">Play matches to populate stats.</p>';
      return;
    }

    // Populate team filter if not already done
    if (refs.statsTeamFilter.options.length <= 1) {
      for (const f of state.franchises) {
        const opt = document.createElement("option");
        opt.value = f.id; opt.textContent = f.short;
        refs.statsTeamFilter.appendChild(opt);
      }
    }

    const search = (refs.statsSearch.value ?? "").toLowerCase();
    const teamFilter = refs.statsTeamFilter.value;
    const roleFilter = refs.statsRoleFilter.value;

    // Build rows from seasonStats
    const rows = [];
    for (const [playerId, s] of Object.entries(state.seasonStats)) {
      if ((s.matches ?? 0) === 0) continue;
      const player = state.players.find((p) => p.id === playerId);
      if (!player) continue;
      const team = state.franchises.find((t) => t.squad.includes(playerId));
      if (!team) continue;

      // Filters
      if (search && !player.name.toLowerCase().includes(search)) continue;
      if (teamFilter !== "all" && team.id !== teamFilter) continue;
      if (roleFilter !== "all" && player.role !== roleFilter) continue;

      // Computed stats
      const battingAvg = (s.innings - s.notOuts) > 0 ? (s.runs / (s.innings - s.notOuts)) : s.runs;
      const strikeRate = s.ballsFaced > 0 ? (s.runs / s.ballsFaced * 100) : 0;
      const bowlingAvg = s.wickets > 0 ? (s.runsConceded / s.wickets) : 0;
      const economy = s.oversBowled > 0 ? (s.runsConceded / s.oversBowled) : 0;
      const bowlingSR = s.wickets > 0 ? ((s.oversBowled * 6) / s.wickets) : 0;
      const hs = s.highScore > 0 ? `${s.highScore}${s.highScoreNotOut ? "*" : ""}` : "-";
      const bb = s.bestBowlingWickets > 0 ? `${s.bestBowlingWickets}/${s.bestBowlingRuns}` : "-";

      rows.push({
        id: playerId, name: player.name, role: player.role,
        teamShort: team.short, teamColors: team.colors,
        matches: s.matches, innings: s.innings, notOuts: s.notOuts,
        runs: s.runs, ballsFaced: s.ballsFaced, fours: s.fours, sixes: s.sixes,
        highScore: s.highScore, hs, battingAvg, strikeRate,
        fifties: s.fifties, hundreds: s.hundreds,
        oversBowled: s.oversBowled, runsConceded: s.runsConceded,
        wickets: s.wickets, economy, bowlingAvg, bowlingSR, bb,
        dots: s.dots, catches: s.catches, pomAwards: s.pomAwards,
      });
    }

    // Sort
    rows.sort((a, b) => {
      const av = a[statsSortKey];
      const bv = b[statsSortKey];
      if (typeof av === "string" || typeof bv === "string") {
        const cmp = String(av ?? "").localeCompare(String(bv ?? ""), undefined, { sensitivity: "base" });
        return cmp * statsSortDir;
      }
      const na = Number(av ?? 0);
      const nb = Number(bv ?? 0);
      return (nb - na) * statsSortDir;
    });

    if (rows.length === 0) {
      refs.statsTableWrap.innerHTML = '<p class="muted-text">No matching players found.</p>';
      return;
    }

    const isBatting = statsTab === "batting";
    const cols = isBatting
      ? [
          { key: "name", label: "Player", cls: "name-col" },
          { key: "teamShort", label: "Team", cls: "team-col" },
          { key: "matches", label: "M" },
          { key: "innings", label: "Inn" },
          { key: "runs", label: "Runs" },
          { key: "hs", label: "HS", sortKey: "highScore" },
          { key: "battingAvg", label: "Avg", fmt: 1 },
          { key: "strikeRate", label: "SR", fmt: 1 },
          { key: "fifties", label: "50s" },
          { key: "hundreds", label: "100s" },
          { key: "fours", label: "4s" },
          { key: "sixes", label: "6s" },
        ]
      : [
          { key: "name", label: "Player", cls: "name-col" },
          { key: "teamShort", label: "Team", cls: "team-col" },
          { key: "matches", label: "M" },
          { key: "oversBowled", label: "Ov" },
          { key: "wickets", label: "Wkts" },
          { key: "bb", label: "BBI", sortKey: "bestBowlingWickets" },
          { key: "economy", label: "Econ", fmt: 2 },
          { key: "bowlingAvg", label: "Avg", fmt: 1 },
          { key: "bowlingSR", label: "SR", fmt: 1 },
          { key: "dots", label: "Dots" },
          { key: "catches", label: "Ct" },
          { key: "pomAwards", label: "POM" },
        ];

    const thRow = cols.map((c) => {
      const sk = c.sortKey ?? c.key;
      const active = statsSortKey === sk;
      const arrow = active ? (statsSortDir === -1 ? " ▼" : " ▲") : "";
      return `<th class="${c.cls ?? "num-col"} sortable" data-sort="${sk}">${c.label}${arrow}</th>`;
    }).join("");

    const bodyRows = rows.slice(0, 80).map((r, idx) => {
      const cells = cols.map((c) => {
        let val = r[c.key];
        if (c.fmt !== undefined && typeof val === "number") val = val.toFixed(c.fmt);
        if (c.key === "name") {
          const roleClass = r.role.toLowerCase();
          return `<td class="name-col"><span class="role-dot ${roleClass}"></span>${val}</td>`;
        }
        if (c.key === "teamShort") {
          const bg = r.teamColors?.primary ?? "#666";
          return `<td class="team-col"><span class="team-pill" style="background:${bg}">${val}</span></td>`;
        }
        return `<td class="num-col">${val}</td>`;
      }).join("");
      return `<tr class="${idx % 2 === 0 ? "even" : "odd"}">${cells}</tr>`;
    }).join("");

    refs.statsTableWrap.innerHTML = `
      <table class="stats-table">
        <thead><tr>${thRow}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
    `;

    // Wire up sort headers
    refs.statsTableWrap.querySelectorAll("th.sortable").forEach((th) => {
      th.addEventListener("click", () => {
        const key = th.dataset.sort;
        if (statsSortKey === key) statsSortDir *= -1;
        else { statsSortKey = key; statsSortDir = -1; }
        renderStats();
      }, { once: true });
    });
  }

  function initStatsListeners() {
    // Tab toggle
    refs.statsBattingTab?.addEventListener("click", () => {
      statsTab = "batting"; statsSortKey = "runs"; statsSortDir = -1;
      refs.statsBattingTab.classList.add("active");
      refs.statsBowlingTab.classList.remove("active");
      renderStats();
    });
    refs.statsBowlingTab?.addEventListener("click", () => {
      statsTab = "bowling"; statsSortKey = "wickets"; statsSortDir = -1;
      refs.statsBowlingTab.classList.add("active");
      refs.statsBattingTab.classList.remove("active");
      renderStats();
    });
    // Filters
    refs.statsSearch?.addEventListener("input", () => renderStats());
    refs.statsTeamFilter?.addEventListener("change", () => renderStats());
    refs.statsRoleFilter?.addEventListener("change", () => renderStats());
  }

  // ── Scorecard Modal (view from recent matches) ──────────────────────────────

  function showScorecardModal(matchEntry) {
    if (!matchEntry) return;
    const sc1 = matchEntry.innings1Scorecard;
    const sc2 = matchEntry.innings2Scorecard;
    if (!sc1 && !sc2) {
      addLog("Scorecard not available for this match.", "neutral");
      return;
    }

    const homeTeam = getTeamById(matchEntry.homeId);
    const awayTeam = getTeamById(matchEntry.awayId);
    const firstTeam = getTeamById(matchEntry.firstBattingId);
    const secondTeam = matchEntry.firstBattingId === matchEntry.homeId ? awayTeam : homeTeam;

    function buildBattingHTML(card, teamName) {
      if (!card?.battingCard?.length) return "";
      const rows = card.battingCard.map((b) =>
        `<tr>
          <td class="sc-name"><span class="role-dot ${b.role.toLowerCase()}"></span>${b.name}</td>
          <td class="sc-num">${b.runs}</td>
          <td class="sc-num">${b.balls}</td>
          <td class="sc-num">${b.fours}</td>
          <td class="sc-num">${b.sixes}</td>
          <td class="sc-num">${b.sr}</td>
          <td class="sc-num">${b.notOut ? "not out" : ""}</td>
        </tr>`
      ).join("");
      return `<div class="sc-section">
        <p class="sc-team-label">${teamName} — Batting</p>
        <table class="sc-table"><thead><tr>
          <th>Batter</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th><th></th>
        </tr></thead><tbody>${rows}</tbody></table>
      </div>`;
    }

    function buildBowlingHTML(card, teamName) {
      if (!card?.bowlingCard?.length) return "";
      const rows = card.bowlingCard.map((bw) =>
        `<tr>
          <td class="sc-name"><span class="role-dot ${bw.role.toLowerCase()}"></span>${bw.name}</td>
          <td class="sc-num">${bw.overs}</td>
          <td class="sc-num">${bw.runsConceded}</td>
          <td class="sc-num">${bw.wickets}</td>
          <td class="sc-num">${bw.economy}</td>
          <td class="sc-num">${bw.dots}</td>
        </tr>`
      ).join("");
      return `<div class="sc-section">
        <p class="sc-team-label">${teamName} — Bowling</p>
        <table class="sc-table"><thead><tr>
          <th>Bowler</th><th>Ov</th><th>R</th><th>W</th><th>Econ</th><th>Dots</th>
        </tr></thead><tbody>${rows}</tbody></table>
      </div>`;
    }

    const html = `
      <div class="scorecard-modal-inner">
        <div class="sc-header">
          <h3>${homeTeam.short} ${matchEntry.homeScore} vs ${awayTeam.short} ${matchEntry.awayScore}</h3>
          <p class="sc-summary">${matchEntry.summary}</p>
        </div>
        <div class="sc-innings">
          <p class="sc-innings-title">1st Innings: ${firstTeam.short} ${matchEntry.firstBattingId === matchEntry.homeId ? matchEntry.homeScore : matchEntry.awayScore}</p>
          ${buildBattingHTML(sc1, firstTeam.short)}
          ${buildBowlingHTML(sc1, secondTeam.short)}
        </div>
        <div class="sc-innings">
          <p class="sc-innings-title">2nd Innings: ${secondTeam.short} ${matchEntry.firstBattingId === matchEntry.homeId ? matchEntry.awayScore : matchEntry.homeScore}</p>
          ${buildBattingHTML(sc2, secondTeam.short)}
          ${buildBowlingHTML(sc2, firstTeam.short)}
        </div>
        <button class="button button-primary sc-close-btn" id="closeScorecardBtn">Close</button>
      </div>
    `;

    refs.seasonAwardsContent.classList.add("scorecard-panel");
    refs.seasonAwardsContent.innerHTML = html;
    refs.seasonAwardsModal.classList.add("visible");
    refs.seasonAwardsModal.setAttribute("aria-hidden", "false");
    document.getElementById("closeScorecardBtn")?.addEventListener("click", () => {
      refs.seasonAwardsModal.classList.remove("visible");
      refs.seasonAwardsModal.setAttribute("aria-hidden", "true");
    }, { once: true });
  }

  initialize();
})();
