import { lib, game, ui, get, ai, _status } from "../../../noname.js";

export default {
    code: "20240930_guojia_test",
    name: "郭嘉33测试",
    sex: "male",
    org: "wei",
    hp: 10,
    intro: "字奉孝，颍川阳翟人，官至军师祭酒。惜天妒英才，英年早逝。有诗云：“良计环环不遗策，每临制变满座惊”。",
    image: "guojia",
    skills: {
        tiandu: {
            name: "天妒",
            info: "当你的判定牌生效后，你可以获得之。",
            handle: {
                audio: "tiandu",
                audioname: ["re_guojia", "xizhicai", "gz_nagisa"],
                trigger: { player: "judgeEnd" },
                preHidden: true,
                frequent(event) {
                    //if(get.mode()=='guozhan') return false;
                    return event.result.card.name !== "du";
                },
                check(event) {
                    return event.result.card.name !== "du";
                },
                filter(event, player) {
                    return get.position(event.result.card, true) == "o";
                },
                async content(event, trigger, player) {
                    player.gain(trigger.result.card, "gain2");
                },
            }
        },
        yiji: {
            name: "遗计_4",
            info: "当你受到1点伤害后，你可以观看牌堆顶的两张牌，然后将其分配给任意角色。",
            handle: {
                audio: "yiji",
                trigger: { player: "damageEnd" },
                frequent: true,
                filter(event) {
                    return event.num > 0;
                },
                getIndex(event, player, triggername) {
                    return event.num;
                },
                async content(event, trigger, player) {
                    const { cards } = await game.cardsGotoOrdering(get.cards(4));
                    if (_status.connectMode)
                        game.broadcastAll(function () {
                            _status.noclearcountdown = true;
                        });
                    event.given_map = {};
                    if (!cards.length) return;
                    // event.goto -> do while
                    do {
                        const {
                            result: { bool, links },
                        } =
                            cards.length == 1
                                ? { result: { links: cards.slice(0), bool: true } }
                                : await player.chooseCardButton("遗计：请选择要分配的牌", true, cards, [1, cards.length]).set("ai", () => {
                                    if (ui.selected.buttons.length == 0) return 1;
                                    return 0;
                                });
                        if (!bool) return;
                        cards.removeArray(links);
                        event.togive = links.slice(0);
                        const {
                            result: { targets },
                        } = await player
                            .chooseTarget("选择一名角色获得" + get.translation(links), true)
                            .set("ai", target => {
                                const att = get.attitude(_status.event.player, target);
                                if (_status.event.enemy) {
                                    return -att;
                                } else if (att > 0) {
                                    return att / (1 + target.countCards("h"));
                                } else {
                                    return att / 100;
                                }
                            })
                            .set("enemy", get.value(event.togive[0], player, "raw") < 0);
                        if (targets.length) {
                            const id = targets[0].playerid,
                                map = event.given_map;
                            if (!map[id]) map[id] = [];
                            map[id].addArray(event.togive);
                        }
                    } while (cards.length > 0);
                    if (_status.connectMode) {
                        game.broadcastAll(function () {
                            delete _status.noclearcountdown;
                            game.stopCountChoose();
                        });
                    }
                    const list = [];
                    for (const i in event.given_map) {
                        const source = (_status.connectMode ? lib.playerOL : game.playerMap)[i];
                        player.line(source, "green");
                        if (player !== source && (get.mode() !== "identity" || player.identity !== "nei")) player.addExpose(0.2);
                        list.push([source, event.given_map[i]]);
                    }
                    game.loseAsync({
                        gain_list: list,
                        giver: player,
                        animate: "draw",
                    }).setContent("gaincardMultiple");
                },
                ai: {
                    maixie: true,
                    maixie_hp: true,
                    effect: {
                        target(card, player, target) {
                            if (get.tag(card, "damage")) {
                                if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
                                if (!target.hasFriend()) return;
                                let num = 1;
                                if (get.attitude(player, target) > 0) {
                                    if (player.needsToDiscard()) num = 0.7;
                                    else num = 0.5;
                                }
                                if (target.hp >= 4) return [1, num * 2];
                                if (target.hp == 3) return [1, num * 1.5];
                                if (target.hp == 2) return [1, num * 0.5];
                            }
                        },
                    },
                },
            }
        }
    },
    perfectPairs: [],
}