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
function App() {
  const [members, setMembers] = useState([]);

  const [raidSlots, setRaidSlots] = useState(() => {
    const saved = localStorage.getItem("wowRaidSlots");
    return saved
      ? JSON.parse(saved)
      : Array.from({ length: 25 }, () => null);
  });

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
    .subscribe();

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
  const raidCount = raidMemberIds.length;

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
      member.name.toLowerCase() === cleanName.toLowerCase()
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

  function getClassColor(className) {
    return (
      CLASSES.find((wowClass) => wowClass.name === className)?.color ||
      "#FFFFFF"
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

  const toSlot = over.data.current?.slotIndex;
  const targetType = over.data.current?.targetType;
  const targetMemberId = over.data.current?.targetMemberId;

  // -----------------------------------
  // ROSTER -> RAID
  // -----------------------------------
  if (source === "roster" && typeof toSlot === "number") {
    if (!memberId) return;

    if (raidSlots.includes(memberId)) return;

    setRaidSlots((current) => {
      const copy = [...current];
      copy[toSlot] = memberId;
      return copy;
    });

    return;
  }

  // -----------------------------------
  // RAID -> RAID
  // échange de slots
  // -----------------------------------
  if (
    source === "raid" &&
    typeof fromSlot === "number" &&
    typeof toSlot === "number" &&
    fromSlot !== toSlot
  ) {
    setRaidSlots((current) => {
      const copy = [...current];

      const draggedMember = copy[fromSlot];
      const targetMember = copy[toSlot];

      copy[toSlot] = draggedMember;
      copy[fromSlot] = targetMember;

      return copy;
    });

    return;
  }

  // -----------------------------------
  // RAID -> ZONE ROSTER
  // sort le joueur du raid
  // -----------------------------------
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

  // -----------------------------------
  // RAID -> MEMBRE DU ROSTER
  // échange joueur raid <-> joueur roster
  // -----------------------------------
  if (
    source === "raid" &&
    typeof fromSlot === "number" &&
    targetType === "roster-member" &&
    targetMemberId
  ) {
    // ne rien faire si le membre cible est déjà dans le raid
    if (raidSlots.includes(targetMemberId)) return;

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
          <div>
            <h1>Raid Composer</h1>
            <p>World of Warcraft 2.4.3</p>
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
                inRaid={inRaid}
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

              const groupCount = groupSlots.filter(Boolean).length;

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
          </section>
        </main>

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