import { game } from "../../noname.js";

import roleSource from "./source.js"

// load roles
const ROLES = [];
for (let src of roleSource) {
	let m = await import(`./role/${src}`);
	ROLES.push(m.default);
}

// group info
const GROUP_IDX = "custom";

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
		const ROLE_IDX = `${GROUP_IDX}.${role.code}`
		let skillOutArr = [];
		for (let skillCode in role.skills) {
			const SKILL_IDX = `${ROLE_IDX}.${skillCode}`;
			let skill = role.skills[skillCode];
			skillOutArr.push(SKILL_IDX);
			base.translate[SKILL_IDX] = skill.name;
			base.translate[SKILL_IDX + '_info'] = skill.info;
			base.skill[SKILL_IDX] = skill.handle;
		}
		base.character[ROLE_IDX] = [role.sex, role.org, role.hp, skillOutArr, undefined, {}];
		if (role.image) {
			base.character[ROLE_IDX][5].image = role.image;
		}
		base.translate[ROLE_IDX] = role.name;
		base.characterIntro[ROLE_IDX] = role.intro;
		// TODO
		base.perfectPair[ROLE_IDX] = [ROLE_IDX];
	}
	return base;
});
