import { game } from "../../noname.js";

// roles
import guojia from "./role/guojia.js";
import yuanshao00 from "./role/yuanshao00.js";
const ROLES = [guojia, yuanshao00];

// group info
const GROUP_IDX="custom";

game.import("character", function () {
	let base = {
		name: GROUP_IDX,
		connect: true,
		character: {},
		characterSort: {},
		characterFilter: {},
		characterTitle: {},
		dynamicTranslate: {},
		characterIntro: {},
		characterReplace: {},
		card: {},
		skill: {},
		perfectPair: {},
		translate: {},
		pinyins: {},
	};
	for (let role of ROLES) {
		const ROLE_IDX=`${GROUP_IDX}.${role.code}${role.image?("$"+role.image):""}`
		let skillOutArr = [];
		for (let skillCode in role.skills) {
			const SKILL_IDX= `${ROLE_IDX}.${skillCode}`;
			let skill=role.skills[skillCode];
			skillOutArr.push(SKILL_IDX);
			base.translate[SKILL_IDX] = skill.name;
			base.translate[SKILL_IDX + '_info'] = skill.info;
			base.skill[SKILL_IDX] = skill.handle;
		}
		// base.translate["#" + ROLE_IDX + ':die'] = role.voices.die;
		base.character[ROLE_IDX] = [role.sex, role.org, role.hp, skillOutArr];
		base.translate[ROLE_IDX] = role.name;
		base.characterIntro[ROLE_IDX] = role.intro;
		// TODO
		base.perfectPair[ROLE_IDX] = [ROLE_IDX];
	}
	return base;
});
