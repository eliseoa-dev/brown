import { COLORS } from '../constants.js'

const SECTIONS = [
  {
    title: 'Colony Architecture',
    body: `A mature Atta cephalotes nest is a buried city — up to 8 metres deep, sprawling across tens of square metres, excavated as more than a thousand discrete chambers linked by a lattice of galleries. Foragers move millions of leaf fragments below ground, where the chambers are not dug at random: deeper voids stay cool and stable for brood, while a network of vertical shafts drives passive ventilation. Stale, CO₂-laden air, warmed by the metabolising fungus, rises and escapes through central turrets while fresh air sinks down peripheral tunnels — a wind engine with no moving parts, tuned entirely by chamber geometry.`,
  },
  {
    title: 'The Superorganism',
    body: `No ant holds the plan. Coordination is stigmergic — each worker reacts to chemical traces left by others, and from millions of these local exchanges a coherent global behaviour precipitates. The colony allocates labour, routes traffic, and weighs risk against reward with no central executive, the way cognition emerges from neurons that individually understand nothing. With on the order of millions of workers exchanging signals, the colony's communication network rivals the connection density of a small mammalian brain. The nest is the body; the workers are the distributed mind.`,
  },
  {
    title: 'Caste System',
    body: `A single queen founds and anchors the colony, living 15 to 20 years and laying tens of thousands of eggs across her life; her primer pheromones suppress rival reproduction and bind the workers into one reproductive whole. Major workers — the soldiers — wield massive heads and shearing mandibles to cut the toughest foliage and defend the nest. Minor workers are the numerical backbone, tending fungus and brood. Minims, the smallest caste, ride atop carried leaf fragments, guarding the column against parasitoid phorid flies that would lay eggs in a forager's neck.`,
  },
  {
    title: 'Chemical Language',
    body: `The colony converses in more than twenty distinct glandular signals. A forager that finds rich foliage lays a trail of poison-gland pheromone so potent that a milligram could, in principle, mark a trail around the planet; recruits reinforce productive routes and let depleted ones evaporate, so the network self-prunes. Oleic acid leaking from a dead nestmate triggers necrophoresis — the corpse is hauled to the refuse pile, even if the "dead" ant is merely painted with the molecule. Alarm pheromones from the mandibular gland propagate a defensive cascade outward from any breach in seconds.`,
  },
  {
    title: 'Fungal Cultivation',
    body: `Atta do not eat the leaves they cut. They are farmers of a single domesticated cultivar — Leucoagaricus gongylophorus — a fungus grown on a masticated leaf substrate and found nowhere outside the nest. The fungus digests cellulose the ants cannot and swells into nutrient-rich gongylidia that feed the brood and queen. Workers weed competing molds and dose the garden with antibiotics from Pseudonocardia bacteria cultured on their own bodies. This obligate mutualism — ant, fungus, and bacterium locked together — has been refined over roughly 50 million years of coevolution.`,
  },
]

export default function ScienceTab() {
  return (
    <div className="panel-scroll h-full overflow-y-auto px-4 py-4">
      <div className="flex flex-col gap-5">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h3
              className="font-serif mb-1.5 text-[11px] uppercase"
              style={{ color: COLORS.amber, letterSpacing: '0.12em' }}
            >
              {s.title}
            </h3>
            <p className="font-serif text-[11px] leading-[1.7]" style={{ color: '#cdbf9f' }}>
              {s.body}
            </p>
          </section>
        ))}
        <p className="font-mono text-[9px] leading-relaxed pb-2" style={{ color: '#6d5e44' }}>
          Atta cephalotes — leaf-cutter ant — Formicidae · Myrmicinae · Attini
        </p>
      </div>
    </div>
  )
}
