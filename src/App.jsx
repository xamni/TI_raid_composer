import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import "./App.css";
import { supabase } from "./supabase";

const GROUPS = [1, 2, 3, 4, 5];

const CLASSES = [
  { name: "Warrior", color: "#C79C6E" },
  { name: "Paladin", color: "#F58CBA" },
  { name: "Hunter", color: "#ABD473" },
  { name: "Rogue", color: "#FFF569" },
  { name: "Priest", color: "#FFFFFF" },
  { name: "Shaman", color: "#0070DE" },
  { name: "Mage", color: "#69CCF0" },
  { name: "Warlock", color: "#9482C9" },
  { name: "Druid", color: "#FF7D0A" },
];

const SPECS = {
  Warrior: ["Protection", "Arms", "Fury"],
  Paladin: ["Holy", "Protection", "Retribution"],
  Hunter: ["Beast Mastery", "Marksmanship", "Survival"],
  Rogue: ["Assassination", "Combat", "Subtlety"],
  Priest: ["Discipline", "Holy", "Shadow"],
  Shaman: ["Elemental", "Enhancement", "Restoration"],
  Mage: ["Arcane", "Fire", "Frost"],
  Warlock: ["Affliction", "Demonology", "Destruction"],
  Druid: ["Balance", "Feral", "Restoration"],
};

const SPEC_ICONS = {
  Warrior: {
    Protection: "https://wow.zamimg.com/images/wow/icons/large/ability_warrior_defensivestance.jpg",
    Arms: "https://wow.zamimg.com/images/wow/icons/large/ability_warrior_savageblow.jpg",
    Fury: "https://wow.zamimg.com/images/wow/icons/large/ability_warrior_innerrage.jpg",
  },

  Paladin: {
    Holy: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_holybolt.jpg",
    Protection: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_devotionaura.jpg",
    Retribution: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_auraoflight.jpg",
  },

  Hunter: {
    "Beast Mastery":
      "https://wow.zamimg.com/images/wow/icons/large/ability_hunter_beasttaming.jpg",
    Marksmanship:
      "https://wow.zamimg.com/images/wow/icons/large/ability_marksmanship.jpg",
    Survival:
      "https://wow.zamimg.com/images/wow/icons/large/ability_hunter_swiftstrike.jpg",
  },

  Rogue: {
    Assassination:
      "https://wow.zamimg.com/images/wow/icons/large/ability_rogue_eviscerate.jpg",
    Combat:
      "https://wow.zamimg.com/images/wow/icons/large/ability_backstab.jpg",
    Subtlety:
      "https://wow.zamimg.com/images/wow/icons/large/ability_stealth.jpg",
  },

  Priest: {
    Discipline:
      "https://wow.zamimg.com/images/wow/icons/large/spell_holy_wordfortitude.jpg",
    Holy:
      "https://wow.zamimg.com/images/wow/icons/large/spell_holy_holybolt.jpg",
    Shadow:
      "https://wow.zamimg.com/images/wow/icons/large/spell_shadow_shadowwordpain.jpg",
  },

  Shaman: {
    Elemental:
      "https://wow.zamimg.com/images/wow/icons/large/spell_nature_lightning.jpg",
    Enhancement:
      "https://wow.zamimg.com/images/wow/icons/large/spell_nature_lightningshield.jpg",
    Restoration:
      "https://wow.zamimg.com/images/wow/icons/large/spell_nature_magicimmunity.jpg",
  },

  Mage: {
    Arcane:
      "https://wow.zamimg.com/images/wow/icons/large/spell_holy_magicalsentry.jpg",
    Fire:
      "https://wow.zamimg.com/images/wow/icons/large/spell_fire_firebolt02.jpg",
    Frost:
      "https://wow.zamimg.com/images/wow/icons/large/spell_frost_frostbolt02.jpg",
  },

  Warlock: {
    Affliction:
      "https://wow.zamimg.com/images/wow/icons/large/spell_shadow_deathcoil.jpg",
    Demonology:
      "https://wow.zamimg.com/images/wow/icons/large/spell_shadow_metamorphosis.jpg",
    Destruction:
      "https://wow.zamimg.com/images/wow/icons/large/spell_shadow_rainoffire.jpg",
  },

  Druid: {
    Balance:
      "https://wow.zamimg.com/images/wow/icons/large/spell_nature_starfall.jpg",
    Feral:
      "https://wow.zamimg.com/images/wow/icons/large/ability_racial_bearform.jpg",
    Restoration:
      "https://wow.zamimg.com/images/wow/icons/large/spell_nature_healingtouch.jpg",
  },
};

const GROUP_BUFFS = [
  {
    key: "bloodlust",
    label: "Bloodlust",
    icon: "https://wow.zamimg.com/images/wow/icons/large/spell_nature_bloodlust.jpg",
    condition: (member) => member.className === "Shaman",
  },
  {
    key: "windfury",
    label: "Windfury",
    icon: "https://wow.zamimg.com/images/wow/icons/large/spell_nature_windfury.jpg",
    condition: (member) =>
      member.className === "Shaman" &&
      member.spec === "Enhancement",
  },
  {
    key: "totem-of-wrath",
    label: "Totem of Wrath",
    icon: "https://wow.zamimg.com/images/wow/icons/large/spell_fire_totemofwrath.jpg",
    condition: (member) =>
      member.className === "Shaman" &&
      member.spec === "Elemental",
  },
  {
    key: "mana-tide",
    label: "Mana Tide",
    icon: "https://wow.zamimg.com/images/wow/icons/large/spell_frost_summonwaterelemental.jpg",
    condition: (member) =>
      member.className === "Shaman" &&
      member.spec === "Restoration",
  },
  {
    key: "leader-of-the-pack",
    label: "Leader of the Pack",
    icon: "https://wow.zamimg.com/images/wow/icons/large/spell_nature_unyeildingstamina.jpg",
    condition: (member) =>
      member.className === "Druid" &&
      member.spec === "Feral",
  },
  {
    key: "moonkin-aura",
    label: "Moonkin Aura",
    icon: "https://wow.zamimg.com/images/wow/icons/large/spell_nature_moonglow.jpg",
    condition: (member) =>
      member.className === "Druid" &&
      member.spec === "Balance",
  },
  {
    key: "vampiric-touch",
    label: "Vampiric Touch",
    icon: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_stoicism.jpg",
    condition: (member) =>
      member.className === "Priest" &&
      member.spec === "Shadow",
  },
  {
    key: "battle-shout",
    label: "Battle Shout",
    icon: "https://wow.zamimg.com/images/wow/icons/large/ability_warrior_battleshout.jpg",
    condition: (member) => member.className === "Warrior",
  },
  {
    key: "trueshot-aura",
    label: "Trueshot Aura",
    icon: "https://wow.zamimg.com/images/wow/icons/large/ability_trueshot.jpg",
    condition: (member) =>
      member.className === "Hunter" &&
      member.spec === "Marksmanship",
  },
];

const ROLES = ["Tank", "Healer", "Melee DPS", "Ranged DPS"];

function DraggablePlayer({
  member,
  slotIndex,
  getClassColor,
  getSpecIcon,
  removeFromRaid,
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `player-${member.id}`,
      data: {
        memberId: member.id,
        slotIndex,
        source: "raid",
      },
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 999 : "auto",
    position: "relative",
    borderLeftColor: getClassColor(member.className),
  };

  return (
    <div
      ref={setNodeRef}
      className="raid-slot filled-slot"
      style={style}
      {...attributes}
      {...listeners}
    >
      <img
  className="spec-icon"
  src={getSpecIcon(member)}
  alt={`${member.className} ${member.spec}`}
/>

      <div className="slot-player-info">
        <strong style={{ color: getClassColor(member.className) }}>
          {member.name}
        </strong>
        <span>{member.spec}</span>
      </div>

      <button
        className="remove-player"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          removeFromRaid(slotIndex);
        }}
        title="Retirer du raid"
      >
        ×
      </button>
    </div>
  );
}

function DraggableRosterMember({
  member,
  getClassColor,
  getSpecIcon,
  inRaid,
  deleteMember,
}) {
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `roster-${member.id}`,
    data: {
      memberId: member.id,
      source: "roster",
    },
    disabled: inRaid,
  });

  const {
    setNodeRef: setDroppableRef,
    isOver,
  } = useDroppable({
    id: `roster-target-${member.id}`,
    data: {
      targetType: "roster-member",
      targetMemberId: member.id,
    },
  });

  function setRefs(node) {
    setDraggableRef(node);
    setDroppableRef(node);
  }

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.45 : inRaid ? 0.4 : 1,
    zIndex: isDragging ? 999 : "auto",
    position: "relative",
  };

  return (
    <div
      ref={setRefs}
      className={`roster-member ${inRaid ? "in-raid" : ""} ${
        isOver ? "roster-member-over" : ""
      }`}
      style={style}
      {...attributes}
      {...listeners}
    >
      <img
  className="spec-icon roster-spec-icon"
  src={getSpecIcon(member)}
  alt={`${member.className} ${member.spec}`}
/>

      <div className="member-info">
        <strong
          style={{
            color: getClassColor(member.className),
          }}
        >
          {member.name}
        </strong>

        <span>
          {member.className} • {member.spec}
        </span>

        <small>{member.role}</small>
      </div>

      <button
        className="delete-member"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          deleteMember(member.id);
        }}
        title="Supprimer le membre"
      >
        ×
      </button>
    </div>
  );
}

function DroppableSlot({
  slotIndex,
  member,
  getClassColor,
  getSpecIcon,
  removeFromRaid,
  onSelectSlot,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${slotIndex}`,
    data: { slotIndex },
  });

  return (
    <div
      ref={setNodeRef}
      className={`drop-zone ${isOver ? "drop-zone-over" : ""}`}
    >
      {member ? (
        <DraggablePlayer
          member={member}
          slotIndex={slotIndex}
          getClassColor={getClassColor}
          getSpecIcon={getSpecIcon}
          removeFromRaid={removeFromRaid}
        />
      ) : (
        <button
          className="raid-slot"
          onClick={() => onSelectSlot(slotIndex)}
        >
          <span className="slot-plus">+</span>
          <span>Choisir un joueur</span>
        </button>
      )}
    </div>
  );
}
function DroppableRoster({ children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "roster-drop-zone",
    data: {
      targetType: "roster-zone",
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`roster-drop-zone ${
        isOver ? "roster-drop-zone-over" : ""
      }`}
    >
      {children}
    </div>
  );
}
function DraggableBenchMember({
  member,
  getClassColor,
  getSpecIcon,
  removeFromBench,
}) {
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `bench-${member.id}`,
    data: {
      memberId: member.id,
      source: "bench",
    },
  });

  const {
    setNodeRef: setDroppableRef,
    isOver,
  } = useDroppable({
    id: `bench-target-${member.id}`,
    data: {
      targetType: "bench-member",
      targetMemberId: member.id,
    },
  });

  function setRefs(node) {
    setDraggableRef(node);
    setDroppableRef(node);
  }

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    borderLeft: `4px solid ${getClassColor(member.className)}`,
  };

  return (
  <div
    ref={setRefs}
    style={style}
    className={`bench-member ${
      isOver ? "bench-member-over" : ""
    }`}
    {...listeners}
    {...attributes}
  >
    {getSpecIcon(member) && (
      <img
        className="spec-icon"
        src={getSpecIcon(member)}
        alt={member.spec}
      />
    )}

    <div className="bench-member-info">
  <strong
    style={{
      color: getClassColor(member.className),
    }}
  >
    {member.name}
  </strong>

  <span>{member.spec}</span>
</div>

    <button
      className="remove-player"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        removeFromBench(member.id);
      }}
      title="Retirer du bench"
    >
      ×
    </button>
  </div>
);
}

function DroppableBench({
  benchMembers,
  getMember,
  getClassColor,
  getSpecIcon,
  removeFromBench,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: "bench-zone",
    data: {
      targetType: "bench-zone",
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`bench-zone ${isOver ? "bench-zone-over" : ""}`}
    >
      {benchMembers.length === 0 ? (
        <span className="bench-empty">
          Glisser des joueurs ici
        </span>
      ) : (
        <div className="bench-list">
          {benchMembers.map((memberId) => {
            const member = getMember(memberId);

            if (!member) return null;

            return (
              <DraggableBenchMember
                key={member.id}
                member={member}
                getClassColor={getClassColor}
                getSpecIcon={getSpecIcon}
                removeFromBench={removeFromBench}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
function DraggableSwitchMember({
  member,
  switchId,
  getClassColor,
  getSpecIcon,
  removeFromSwitch,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `switch-${switchId}-${member.id}`,
    data: {
      memberId: member.id,
      source: "switch",
      switchId,
    },
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

 return (
  <div
    ref={setNodeRef}
    style={style}
    className="switch-member"
    {...listeners}
    {...attributes}
  >
    <img
      className="spec-icon"
      src={getSpecIcon(member)}
      alt={member.spec}
    />

    <div className="switch-member-info">
      <strong
        style={{
          color: getClassColor(member.className),
        }}
      >
        {member.name}
      </strong>

      <span>{member.spec}</span>
    </div>

    <button
      className="remove-player"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        removeFromSwitch(switchId, member.id);
      }}
      title="Retirer du switch"
    >
      ×
    </button>
  </div>
  );
}
function SwitchPanel({
  switchData,
  getMember,
  getClassColor,
  getSpecIcon,
  updateSwitchBoss,
  removeSwitch,
  removeFromSwitch,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `switch-zone-${switchData.id}`,
    data: {
      targetType: "switch-zone",
      switchId: switchData.id,
    },
  });

  return (
    <div className="switch-panel">
      <div className="switch-header">
        <input
          type="text"
          value={switchData.bossName}
          onChange={(event) =>
            updateSwitchBoss(
              switchData.id,
              event.target.value
            )
          }
          placeholder="Nom du boss..."
        />

        <button
          className="switch-delete"
          onClick={() => removeSwitch(switchData.id)}
          title="Supprimer ce switch"
        >
          ×
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`switch-members ${
          isOver ? "switch-members-over" : ""
        }`}
      >
        {(switchData.members || []).length === 0 ? (
          <span className="switch-empty">
            Glisser des joueurs ici
          </span>
        ) : (
          (switchData.members || []).map((memberId) => {
            const member = getMember(memberId);

            if (!member) return null;

            return (
              <DraggableSwitchMember
                key={member.id}
                member={member}
                switchId={switchData.id}
                getClassColor={getClassColor}
                getSpecIcon={getSpecIcon}
                removeFromSwitch={removeFromSwitch}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
function App() {
  const [members, setMembers] = useState([]);

  const [raidSlots, setRaidSlots] = useState(() => {
    const saved = localStorage.getItem("wowRaidSlots");
    return saved
      ? JSON.parse(saved)
      : Array.from({ length: 25 }, () => null);
  });

  const [benchMembers, setBenchMembers] = useState(() => {
  const saved = localStorage.getItem("wowRaidBench");
  return saved ? JSON.parse(saved) : [];
  });
  const [switches, setSwitches] = useState(() => {
  const saved = localStorage.getItem("wowRaidSwitches");
  return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
  localStorage.setItem(
    "wowRaidBench",
    JSON.stringify(benchMembers)
  );
  }, [benchMembers]);
  useEffect(() => {
    localStorage.setItem(
    "wowRaidSwitches",
    JSON.stringify(switches)
  );
  }, [switches]);

  useEffect(() => {
  async function loadMembers() {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Erreur chargement roster :", error);
      return;
    }

    const formattedMembers = data.map((member) => ({
      id: member.id,
      name: member.name,
      className: member.class_name,
      spec: member.spec,
      role: member.role,
    }));

    setMembers(formattedMembers);
  }

  loadMembers();

  const channel = supabase
    .channel("members-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "members",
      },
      () => {
        loadMembers();
      }
    )
    .subscribe((status) => {
  console.log("REALTIME STATUS:", status);
});

  return () => {
    supabase.removeChannel(channel);
  };
  }, []);

  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [search, setSearch] = useState("");

  const [newMember, setNewMember] = useState({
    name: "",
    className: "Warrior",
    spec: "Protection",
    role: "Tank",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    localStorage.setItem("wowRaidSlots", JSON.stringify(raidSlots));
  }, [raidSlots]);

  const raidMemberIds = raidSlots.filter(Boolean);
  const raidCount = raidSlots.filter(
  (memberId) => memberId && getMember(memberId)
  ).length;

  const availableMembers = useMemo(() => {
    return members.filter((member) => {
      const alreadyInRaid = raidMemberIds.includes(member.id);
      const matchesSearch = member.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return !alreadyInRaid && matchesSearch;
    });
  }, [members, raidMemberIds, search]);

  async function addMember(event) {
  event.preventDefault();

  const cleanName = newMember.name.trim();

  if (!cleanName) {
    alert("Entre un nom pour le membre.");
    return;
  }

  const alreadyExists = members.some(
  (member) =>
    member.name.toLowerCase() === cleanName.toLowerCase() &&
    member.spec === newMember.spec
);
  if (alreadyExists) {
    alert("Ce membre existe déjà dans le roster.");
    return;
  }

  const { data, error } = await supabase
    .from("members")
    .insert([
      {
        name: cleanName,
        class_name: newMember.className,
        spec: newMember.spec,
        role: newMember.role,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Erreur ajout membre :", error);
    alert("Impossible d'ajouter le membre.");
    return;
  }

  const member = {
    id: data.id,
    name: data.name,
    className: data.class_name,
    spec: data.spec,
    role: data.role,
  };

  setMembers((current) => [...current, member]);

  setNewMember({
    name: "",
    className: "Warrior",
    spec: "Protection",
    role: "Tank",
  });

  setShowAddMember(false);
}

  function chooseMember(memberId) {
    if (selectedSlot === null) return;

    setRaidSlots((current) => {
      const copy = [...current];
      copy[selectedSlot] = memberId;
      return copy;
    });

    setSelectedSlot(null);
    setSearch("");
  }

  function removeFromRaid(slotIndex) {
    setRaidSlots((current) => {
      const copy = [...current];
      copy[slotIndex] = null;
      return copy;
    });
  }

  async function deleteMember(memberId) {
  const member = members.find((item) => item.id === memberId);
  if (!member) return;

  const confirmed = window.confirm(
    `Supprimer ${member.name} du roster ?`
  );

  if (!confirmed) return;

  const { error } = await supabase
    .from("members")
    .delete()
    .eq("id", memberId);

  if (error) {
    console.error("Erreur suppression membre :", error);
    alert("Impossible de supprimer le membre.");
    return;
  }

  setMembers((current) =>
    current.filter((item) => item.id !== memberId)
  );

  setRaidSlots((current) =>
    current.map((slotMemberId) =>
      slotMemberId === memberId ? null : slotMemberId
    )
  );
  }
  function getMember(memberId) {
    return members.find((member) => member.id === memberId);
  }

  function addSwitch() {
  if (switches.length >= 5) {
    alert("Maximum 5 fenêtres Switch.");
    return;
  }

  setSwitches((current) => [
    ...current,
    {
      id: crypto.randomUUID(),
      bossName: "",
      members: [],
    },
  ]);
}

function removeSwitch(switchId) {
  setSwitches((current) =>
    current.filter((item) => item.id !== switchId)
  );
}
function removeFromSwitch(switchId, memberId) {
  setSwitches((current) =>
    current.map((item) =>
      item.id === switchId
        ? {
            ...item,
            members: (item.members || []).filter(
              (id) => id !== memberId
            ),
          }
        : item
    )
  );
}

function updateSwitchBoss(switchId, bossName) {
  setSwitches((current) =>
    current.map((item) =>
      item.id === switchId
        ? { ...item, bossName }
        : item
    )
  );
}

  function getClassColor(className) {
    return (
      CLASSES.find((wowClass) => wowClass.name === className)?.color ||
      "#FFFFFF"
    );
  }

  function removeFromBench(memberId) {
    setBenchMembers((current) =>
      current.filter((id) => id !== memberId)
    );
  }

  function getSpecIcon(member) {
  return SPEC_ICONS[member.className]?.[member.spec] || "";
  }
  
  function getGroupBuffs(groupMemberIds) {
  const groupMembers = groupMemberIds
    .map((memberId) => getMember(memberId))
    .filter(Boolean);

  return GROUP_BUFFS.filter((buff) =>
    groupMembers.some((member) => buff.condition(member))
    );
  }


  function handleClassChange(className) {
    setNewMember((current) => ({
      ...current,
      className,
      spec: SPECS[className][0],
    }));
  }

function handleDragEnd(event) {
  const { active, over } = event;

  if (!over) return;

  const source = active.data.current?.source;
  const memberId = active.data.current?.memberId;
  const fromSlot = active.data.current?.slotIndex;
  const sourceSwitchId = active.data.current?.switchId;

  const toSlot = over.data.current?.slotIndex;
  const targetType = over.data.current?.targetType;
  const targetMemberId = over.data.current?.targetMemberId;
  const targetSwitchId = over.data.current?.switchId;

  if (!memberId) return;

  // ===================================
  // PETITE FONCTION :
  // ajoute un joueur dans un Switch
  // sans doublon
  // ===================================
  function addToSwitch(switchId, playerId) {
    setSwitches((current) =>
      current.map((item) => {
        if (item.id !== switchId) return item;

        const currentMembers = item.members || [];

        if (currentMembers.includes(playerId)) {
          return item;
        }

        return {
          ...item,
          members: [...currentMembers, playerId],
        };
      })
    );
  }

  // ===================================
  // ROSTER / RAID / BENCH -> SWITCH
  //
  // IMPORTANT :
  // le joueur reste dans sa position actuelle.
  // Le Switch est seulement informatif.
  // ===================================
  if (
    (source === "roster" ||
      source === "raid" ||
      source === "bench") &&
    targetType === "switch-zone" &&
    targetSwitchId
  ) {
    addToSwitch(targetSwitchId, memberId);
    return;
  }

  // ===================================
  // SWITCH -> SWITCH
  //
  // Déplace le joueur d'une fenêtre
  // Switch vers une autre.
  // ===================================
  if (
    source === "switch" &&
    targetType === "switch-zone" &&
    sourceSwitchId &&
    targetSwitchId
  ) {
    if (sourceSwitchId === targetSwitchId) return;

    setSwitches((current) =>
      current.map((item) => {
        let members = item.members || [];

        if (item.id === sourceSwitchId) {
          members = members.filter(
            (id) => id !== memberId
          );
        }

        if (
          item.id === targetSwitchId &&
          !members.includes(memberId)
        ) {
          members = [...members, memberId];
        }

        return {
          ...item,
          members,
        };
      })
    );

    return;
  }

  // ===================================
  // SWITCH -> ROSTER
  //
  // Retire uniquement le joueur du
  // Switch.
  //
  // Ça ne modifie PAS sa vraie position
  // Raid / Bench.
  // ===================================
  if (
    source === "switch" &&
    sourceSwitchId &&
    (
      targetType === "roster-zone" ||
      targetType === "roster-member"
    )
  ) {
    setSwitches((current) =>
      current.map((item) =>
        item.id === sourceSwitchId
          ? {
              ...item,
              members: (item.members || []).filter(
                (id) => id !== memberId
              ),
            }
          : item
      )
    );

    return;
  }

  // ===================================
  // SWITCH -> RAID
  //
  // Applique réellement le joueur
  // dans la compo.
  //
  // Le joueur RESTE aussi affiché dans
  // son Switch.
  // ===================================
  if (
    source === "switch" &&
    typeof toSlot === "number"
  ) {
    const currentRaidSlot =
      raidSlots.indexOf(memberId);

    const isOnBench =
      benchMembers.includes(memberId);

    // -----------------------------------
    // Le joueur est déjà dans le RAID
    // -> échange de slots
    // -----------------------------------
    if (currentRaidSlot !== -1) {
      if (currentRaidSlot === toSlot) return;

      setRaidSlots((current) => {
        const copy = [...current];

        const targetPlayer = copy[toSlot];

        copy[toSlot] = memberId;
        copy[currentRaidSlot] = targetPlayer;

        return copy;
      });

      return;
    }

    // -----------------------------------
    // Le joueur est sur le BENCH
    // -> échange Bench <-> Raid
    // -----------------------------------
    if (isOnBench) {
      setRaidSlots((current) => {
        const copy = [...current];

        const replacedMember = copy[toSlot];

        copy[toSlot] = memberId;

        setBenchMembers((bench) => {
          const withoutDragged = bench.filter(
            (id) => id !== memberId
          );

          if (!replacedMember) {
            return withoutDragged;
          }

          if (
            withoutDragged.includes(replacedMember)
          ) {
            return withoutDragged;
          }

          return [
            ...withoutDragged,
            replacedMember,
          ];
        });

        return copy;
      });

      return;
    }

    // -----------------------------------
    // Le joueur n'est ni Raid ni Bench
    // -> il entre simplement dans le Raid
    // -----------------------------------
    setRaidSlots((current) => {
      const copy = [...current];
      copy[toSlot] = memberId;
      return copy;
    });

    return;
  }

  // ===================================
  // SWITCH -> BENCH
  // ===================================
  if (
    source === "switch" &&
    (
      targetType === "bench-zone" ||
      targetType === "bench-member"
    )
  ) {
    const currentRaidSlot =
      raidSlots.indexOf(memberId);

    // -----------------------------------
    // SWITCH -> joueur précis du Bench
    // échange si possible
    // -----------------------------------
    if (
      targetType === "bench-member" &&
      targetMemberId &&
      targetMemberId !== memberId
    ) {
      setBenchMembers((current) =>
        current.map((id) =>
          id === targetMemberId
            ? memberId
            : id
        )
      );

      // Si le joueur Switch était dans le Raid,
      // le joueur Bench prend sa place.
      if (currentRaidSlot !== -1) {
        setRaidSlots((current) => {
          const copy = [...current];
          copy[currentRaidSlot] =
            targetMemberId;
          return copy;
        });
      }

      return;
    }

    // -----------------------------------
    // SWITCH -> zone Bench
    // -----------------------------------
    if (currentRaidSlot !== -1) {
      setRaidSlots((current) => {
        const copy = [...current];
        copy[currentRaidSlot] = null;
        return copy;
      });
    }

    setBenchMembers((current) => {
      if (current.includes(memberId)) {
        return current;
      }

      return [...current, memberId];
    });

    return;
  }

  // ===================================
  // ROSTER -> MEMBRE DU BENCH
  // échange Roster <-> Bench
  // ===================================
  if (
    source === "roster" &&
    targetType === "bench-member" &&
    targetMemberId
  ) {
    if (raidSlots.includes(memberId)) return;
    if (benchMembers.includes(memberId)) return;

    setBenchMembers((current) =>
      current.map((id) =>
        id === targetMemberId
          ? memberId
          : id
      )
    );

    return;
  }

  // ===================================
  // ROSTER -> BENCH
  // ===================================
  if (
    source === "roster" &&
    targetType === "bench-zone"
  ) {
    if (benchMembers.includes(memberId)) return;
    if (raidSlots.includes(memberId)) return;

    setBenchMembers((current) => [
      ...current,
      memberId,
    ]);

    return;
  }

  // ===================================
  // RAID -> MEMBRE DU BENCH
  // échange Raid <-> Bench
  // ===================================
  if (
    source === "raid" &&
    typeof fromSlot === "number" &&
    targetType === "bench-member" &&
    targetMemberId
  ) {
    setRaidSlots((current) => {
      const copy = [...current];

      const raidMemberId = copy[fromSlot];

      copy[fromSlot] = targetMemberId;

      setBenchMembers((bench) =>
        bench.map((id) =>
          id === targetMemberId
            ? raidMemberId
            : id
        )
      );

      return copy;
    });

    return;
  }

  // ===================================
  // RAID -> BENCH
  // ===================================
  if (
    source === "raid" &&
    typeof fromSlot === "number" &&
    targetType === "bench-zone"
  ) {
    setRaidSlots((current) => {
      const copy = [...current];
      copy[fromSlot] = null;
      return copy;
    });

    setBenchMembers((current) => {
      if (current.includes(memberId)) {
        return current;
      }

      return [...current, memberId];
    });

    return;
  }

  // ===================================
  // BENCH -> MEMBRE DU BENCH
  // échange de position dans le Bench
  // ===================================
  if (
    source === "bench" &&
    targetType === "bench-member" &&
    targetMemberId &&
    targetMemberId !== memberId
  ) {
    setBenchMembers((current) => {
      const copy = [...current];

      const fromIndex =
        copy.indexOf(memberId);

      const toIndex =
        copy.indexOf(targetMemberId);

      if (
        fromIndex === -1 ||
        toIndex === -1
      ) {
        return current;
      }

      copy[fromIndex] = targetMemberId;
      copy[toIndex] = memberId;

      return copy;
    });

    return;
  }

  // ===================================
  // BENCH -> RAID
  // ===================================
  if (
    source === "bench" &&
    typeof toSlot === "number"
  ) {
    setRaidSlots((current) => {
      const copy = [...current];

      const replacedMember = copy[toSlot];

      copy[toSlot] = memberId;

      if (
        replacedMember &&
        replacedMember !== memberId
      ) {
        setBenchMembers((bench) => {
          const withoutDragged =
            bench.filter(
              (id) => id !== memberId
            );

          if (
            withoutDragged.includes(
              replacedMember
            )
          ) {
            return withoutDragged;
          }

          return [
            ...withoutDragged,
            replacedMember,
          ];
        });
      } else {
        setBenchMembers((bench) =>
          bench.filter(
            (id) => id !== memberId
          )
        );
      }

      return copy;
    });

    return;
  }

  // ===================================
  // BENCH -> MEMBRE DU ROSTER
  // échange Bench <-> Roster
  // ===================================
  if (
    source === "bench" &&
    targetType === "roster-member" &&
    targetMemberId
  ) {
    if (raidSlots.includes(targetMemberId)) {
      return;
    }

    if (benchMembers.includes(targetMemberId)) {
      return;
    }

    setBenchMembers((current) =>
      current.map((id) =>
        id === memberId
          ? targetMemberId
          : id
      )
    );

    return;
  }

  // ===================================
  // BENCH -> ZONE ROSTER
  // sort le joueur du Bench
  // ===================================
  if (
    source === "bench" &&
    targetType === "roster-zone"
  ) {
    setBenchMembers((current) =>
      current.filter(
        (id) => id !== memberId
      )
    );

    return;
  }

  // ===================================
  // ROSTER -> RAID
  // ===================================
  if (
    source === "roster" &&
    typeof toSlot === "number"
  ) {
    if (raidSlots.includes(memberId)) return;
    if (benchMembers.includes(memberId)) return;

    setRaidSlots((current) => {
      const copy = [...current];

      copy[toSlot] = memberId;

      return copy;
    });

    return;
  }

  // ===================================
  // RAID -> RAID
  // échange de slots
  // ===================================
  if (
    source === "raid" &&
    typeof fromSlot === "number" &&
    typeof toSlot === "number" &&
    fromSlot !== toSlot
  ) {
    setRaidSlots((current) => {
      const copy = [...current];

      const draggedMember =
        copy[fromSlot];

      const targetMember =
        copy[toSlot];

      copy[toSlot] = draggedMember;
      copy[fromSlot] = targetMember;

      return copy;
    });

    return;
  }

  // ===================================
  // RAID -> ZONE ROSTER
  // sort du Raid
  // ===================================
  if (
    source === "raid" &&
    typeof fromSlot === "number" &&
    targetType === "roster-zone"
  ) {
    setRaidSlots((current) => {
      const copy = [...current];
      copy[fromSlot] = null;
      return copy;
    });

    return;
  }

  // ===================================
  // RAID -> MEMBRE DU ROSTER
  // échange Raid <-> Roster
  // ===================================
  if (
    source === "raid" &&
    typeof fromSlot === "number" &&
    targetType === "roster-member" &&
    targetMemberId
  ) {
    if (
      raidSlots.includes(targetMemberId)
    ) {
      return;
    }

    if (
      benchMembers.includes(targetMemberId)
    ) {
      return;
    }

    setRaidSlots((current) => {
      const copy = [...current];

      copy[fromSlot] = targetMemberId;

      return copy;
    });

    return;
  }
}
  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="app">
        <header className="topbar">
  <div className="brand">
    <img
      className="guild-logo"
      src="/TI_LOGO-modified.png"
      alt="Totale Impro"
    />

    <div>
      <h1>Totale Impro — Raid Composer</h1>
      <p>The Burning Crusade • 2.4.3</p>
    </div>
  </div>

  <div className="raid-count">{raidCount} / 25</div>
</header>

        <main className="layout">
          <aside className="roster-panel">
  <DroppableRoster>
    <div className="panel-title">
      <div>
        <h2>Roster Guilde</h2>
        <span className="roster-count">
          {members.length} membre
          {members.length > 1 ? "s" : ""}
        </span>
      </div>

      <button onClick={() => setShowAddMember(true)}>
        + Ajouter
      </button>
    </div>

    <input
      className="search"
      type="text"
      placeholder="Rechercher un membre..."
      value={search}
      onChange={(event) => setSearch(event.target.value)}
    />

    <div className="roster-list">
      {members.length === 0 ? (
        <div className="empty-roster">
          Aucun membre pour l'instant.
        </div>
      ) : (
        members
          .filter((member) =>
            member.name
              .toLowerCase()
              .includes(search.toLowerCase())
          )
          .map((member) => {
            const inRaid = raidMemberIds.includes(member.id);

            return (
              <DraggableRosterMember
                key={member.id}
                member={member}
                getClassColor={getClassColor}
                getSpecIcon={getSpecIcon}
                inRaid={
                  raidSlots.includes(member.id) ||
                  benchMembers.includes(member.id)
                }
                deleteMember={deleteMember}
              />
            );
          })
      )}
    </div>
  </DroppableRoster>
</aside>

          <section className="raid-panel">
            {GROUPS.map((groupNumber) => {
              const groupStart = (groupNumber - 1) * 5;
              const groupSlots = raidSlots.slice(
                groupStart,
                groupStart + 5
              );

              const groupCount = groupSlots.filter(
                (memberId) => memberId && getMember(memberId)
                ).length;

              return (
                <div className="raid-group" key={groupNumber}>
                  <div className="group-header">
                    <span>Groupe {groupNumber}</span>
                    <span>{groupCount} / 5</span>
                  </div>

                  <div className="slots">
                    {groupSlots.map((memberId, localIndex) => {
                      const slotIndex = groupStart + localIndex;
                      const member = memberId
                        ? getMember(memberId)
                        : null;

                      return (
                        <DroppableSlot
                          key={slotIndex}
                          slotIndex={slotIndex}
                          member={member}
                          getClassColor={getClassColor}
                          getSpecIcon={getSpecIcon}
                          removeFromRaid={removeFromRaid}
                          onSelectSlot={(index) => {
                            setSelectedSlot(index);
                            setSearch("");
                          }}
                        />
                      );
                    })}
                  </div>

                  <div className="buffs">
  {getGroupBuffs(groupSlots).length === 0 ? (
    <span className="buff-placeholder">
      Aucun buff détecté
    </span>
  ) : (
    <div className="buff-list">
      {getGroupBuffs(groupSlots).map((buff) => (
        <div
          className="buff-item"
          key={buff.key}
          title={buff.label}
        >
          <img src={buff.icon} alt={buff.label} />
        </div>
      ))}
    </div>
  )}
</div>
                </div>
              );
            })}
            
       <div className="bench-panel">
  <div className="bench-header">
    <span>Bench</span>
  </div>

  <DroppableBench
    benchMembers={benchMembers}
    getMember={getMember}
    getClassColor={getClassColor}
    getSpecIcon={getSpecIcon}
    removeFromBench={removeFromBench}
  />
</div>

            <div className="switches-section">
              <div className="switches-title">
                <span>Switch</span>

                {switches.length < 5 && (
                  <button onClick={addSwitch}>
                    + Ajouter un switch
                  </button>
                )}
              </div>

              <div className="switches-grid">
                {switches.map((switchData) => (
                  <SwitchPanel
                    key={switchData.id}
                    switchData={switchData}
                    getMember={getMember}
                    getClassColor={getClassColor}
                    getSpecIcon={getSpecIcon}
                    updateSwitchBoss={updateSwitchBoss}
                    removeSwitch={removeSwitch}
                    removeFromSwitch={removeFromSwitch}
                  />
                ))}
              </div>
            </div>

          </section>
        </main>
        <footer className="app-footer">
  Crafted for Totale Impro by Xamni • 2026
</footer>

        {showAddMember && (
          <div
            className="modal-overlay"
            onMouseDown={() => setShowAddMember(false)}
          >
            <div
              className="modal"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <h2>Ajouter un membre</h2>
                  <p>
                    Ajoute-le une fois, puis réutilise-le dans tous tes raids.
                  </p>
                </div>

                <button
                  className="modal-close"
                  onClick={() => setShowAddMember(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={addMember}>
                <label>
                  Nom du personnage
                  <input
                    autoFocus
                    type="text"
                    placeholder="Ex. Totemgod"
                    value={newMember.name}
                    onChange={(event) =>
                      setNewMember((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  Classe
                  <select
                    value={newMember.className}
                    onChange={(event) =>
                      handleClassChange(event.target.value)
                    }
                  >
                    {CLASSES.map((wowClass) => (
                      <option
                        value={wowClass.name}
                        key={wowClass.name}
                      >
                        {wowClass.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Spécialisation
                  <select
                    value={newMember.spec}
                    onChange={(event) =>
                      setNewMember((current) => ({
                        ...current,
                        spec: event.target.value,
                      }))
                    }
                  >
                    {SPECS[newMember.className].map((spec) => (
                      <option value={spec} key={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Rôle
                  <select
                    value={newMember.role}
                    onChange={(event) =>
                      setNewMember((current) => ({
                        ...current,
                        role: event.target.value,
                      }))
                    }
                  >
                    {ROLES.map((role) => (
                      <option value={role} key={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setShowAddMember(false)}
                  >
                    Annuler
                  </button>

                  <button type="submit" className="primary-button">
                    Ajouter au roster
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedSlot !== null && (
          <div
            className="modal-overlay"
            onMouseDown={() => {
              setSelectedSlot(null);
              setSearch("");
            }}
          >
            <div
              className="modal member-picker"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <h2>Choisir un membre</h2>
                  <p>
                    Slot {selectedSlot + 1} • Clique simplement sur le joueur.
                  </p>
                </div>

                <button
                  className="modal-close"
                  onClick={() => {
                    setSelectedSlot(null);
                    setSearch("");
                  }}
                >
                  ×
                </button>
              </div>

              <input
                autoFocus
                className="search picker-search"
                type="text"
                placeholder="Rechercher un membre..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <div className="picker-list">
                {availableMembers.length === 0 ? (
                  <div className="empty-roster">
                    Aucun membre disponible.
                  </div>
                ) : (
                  availableMembers.map((member) => (
                    <button
                      className="picker-member"
                      key={member.id}
                      onClick={() => chooseMember(member.id)}
                    >
                      <img
  className="spec-icon"
  src={getSpecIcon(member)}
  alt={`${member.className} ${member.spec}`}
/>

                      <div className="member-info">
                        <strong
                          style={{
                            color: getClassColor(member.className),
                          }}
                        >
                          {member.name}
                        </strong>

                        <span>
                          {member.className} • {member.spec}
                        </span>

                        <small>{member.role}</small>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
}

export default App;