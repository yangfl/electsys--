'use strict'
// http://ge.jwc.sjtu.edu.cn/web/sjtu/GESJTU/198254-1980000005500.htm
const COMMON_COURSE = {
  map: {
    'AD011': 1,
    'AM023': 1,
    'AM063': 1,
    'AR001': 1,
    'AR004': 1,
    'AR005': 1,
    'AR006': 1,
    'AR009': 1,
    'BI236': 1,
    'BM010': 1,
    'BM099': 1,
    'CH002': 1,
    'CH010': 1,
    'CH020': 1,
    'CH023': 1,
    'CH029': 1,
    'CH032': 1,
    'CH035': 1,
    'CH037': 1,
    'CH038': 1,
    'CH040': 1,
    'CH043': 1,
    'CH044': 1,
    'CH045': 1,
    'CH050': 1,
    'CH051': 1,
    'CH052': 1,
    'CH053': 1,
    'CH054': 1,
    'CH059': 1,
    'CH065': 1,
    'CH100': 1,
    'CH109': 1,
    'CH144': 1,
    'CH149': 1,
    'CH207': 1,
    'CH208': 1,
    'CL001': 1,
    'CL002': 1,
    'CL003': 1,
    'CL005': 1,
    'CL010': 1,
    'CL011': 1,
    'CL013': 1,
    'CL014': 1,
    'CL015': 1,
    'CL300': 1,
    'CL324': 1,
    'DR001': 1,
    'DR002': 1,
    'EN048': 1,
    'EN113': 1,
    'FM001': 1,
    'FT006': 1,
    'FT014': 1,
    'FT016': 1,
    'FT017': 1,
    'FT018': 1,
    'FT020': 1,
    'FT211': 1,
    'GA306': 1,
    'GE006': 1,
    'HI001': 1,
    'HI003': 1,
    'HI007': 1,
    'HI009': 1,
    'HI010': 1,
    'HI015': 1,
    'HI024': 1,
    'HI025': 1,
    'HI027': 1,
    'HI028': 1,
    'HI029': 1,
    'HI031': 1,
    'HI034': 1,
    'HI035': 1,
    'HI037': 1,
    'HI039': 1,
    'HI040': 1,
    'HI041': 1,
    'HI042': 1,
    'HI043': 1,
    'HI044': 1,
    'HI045': 1,
    'HI046': 1,
    'HI048': 1,
    'HI054': 1,
    'HI056': 1,
    'HI057': 1,
    'HI102': 1,
    'HI109': 1,
    'HU001': 1,
    'JC304': 1,
    'LI003': 1,
    'MU011': 1,
    'MU040': 1,
    'MU125': 1,
    'MU135': 1,
    'MU136': 1,
    'PI003': 1,
    'PI005': 1,
    'PI008': 1,
    'PI013': 1,
    'PI014': 1,
    'PI017': 1,
    'PI020': 1,
    'PI025': 1,
    'PL019': 1,
    'PS002': 1,
    'PU004': 1,
    'PU039': 1,
    'PU085': 1,
    'SO036': 1,
    'SO038': 1,
    'SO039': 1,
    'SO043': 1,
    'SO055': 1,
    'SO057': 1,
    'SO061': 1,
    'SO064': 1,
    'SO108': 1,
    'SP001': 1,
    'SP002': 1,
    'SP003': 1,
    'SP004': 1,
    'SP005': 1,
    'SP006': 1,
    'SP029': 1,
    'SP030': 1,
    'SP043': 1,
    'SP044': 1,
    'SP045': 1,
    'SP055': 1,
    'SP065': 1,
    'SP069': 1,
    'SP079': 1,
    'SP092': 1,
    'SP093': 1,
    'SP095': 1,
    'SP106': 1,
    'SP110': 1,
    'SP116': 1,
    'SP160': 1,
    'SP181': 1,
    'SP184': 1,
    'SP218': 1,
    'SP220': 1,
    'SP238': 1,
    'SP240': 1,
    'AM001': 2,
    'AM002': 2,
    'AM007': 2,
    'AM008': 2,
    'AM016': 2,
    'AM017': 2,
    'AM021': 2,
    'AM024': 2,
    'AM025': 2,
    'AM030': 2,
    'AM039': 2,
    'AM040': 2,
    'AM060': 2,
    'AM061': 2,
    'AM062': 2,
    'AM100': 2,
    'AM108': 2,
    'AR008': 2,
    'BI034': 2,
    'BM006': 2,
    'BM119': 2,
    'BU001': 2,
    'BU002': 2,
    'BU003': 2,
    'BU007': 2,
    'BU100': 2,
    'BU320': 2,
    'BU334': 2,
    'BU463': 2,
    'CH304': 2,
    'CI001': 2,
    'CL007': 2,
    'CL211': 2,
    'EC005': 2,
    'EC008': 2,
    'EC010': 2,
    'EC011': 2,
    'EC015': 2,
    'EC016': 2,
    'EC017': 2,
    'EC018': 2,
    'EC019': 2,
    'EC100': 2,
    'EC307': 2,
    'EC407': 2,
    'EV007': 2,
    'EV020': 2,
    'FI002': 2,
    'FI057': 2,
    'FI058': 2,
    'FI313': 2,
    'FI453': 2,
    'HI030': 2,
    'JC016': 2,
    'JC018': 2,
    'JC201': 2,
    'LA012': 2,
    'LA013': 2,
    'LA015': 2,
    'LA018': 2,
    'LA019': 2,
    'PS001': 2,
    'PS005': 2,
    'PU003': 2,
    'PU006': 2,
    'PU018': 2,
    'PU021': 2,
    'PU028': 2,
    'PU029': 2,
    'PU030': 2,
    'PU031': 2,
    'PU032': 2,
    'PU033': 2,
    'PU034': 2,
    'PU035': 2,
    'PU036': 2,
    'PU037': 2,
    'PU038': 2,
    'PU040': 2,
    'PU041': 2,
    'PU043': 2,
    'PU045': 2,
    'PU046': 2,
    'PU047': 2,
    'PU048': 2,
    'PU050': 2,
    'PU051': 2,
    'PU052': 2,
    'PU053': 2,
    'PU054': 2,
    'PU055': 2,
    'PU056': 2,
    'PU057': 2,
    'PU058': 2,
    'PU059': 2,
    'PU060': 2,
    'PU061': 2,
    'PU062': 2,
    'PU063': 2,
    'PU064': 2,
    'PU071': 2,
    'PU072': 2,
    'PU080': 2,
    'PU099': 2,
    'PU101': 2,
    'SO029': 2,
    'SO050': 2,
    'SO051': 2,
    'SO053': 2,
    'SO062': 2,
    'SO063': 2,
    'SO065': 2,
    'SO066': 2,
    'SO070': 2,
    'SO079': 2,
    'SO080': 2,
    'SO120': 2,
    'SP007': 2,
    'SP014': 2,
    'SP015': 2,
    'SP024': 2,
    'SP028': 2,
    'SP035': 2,
    'SP036': 2,
    'SP037': 2,
    'SP063': 2,
    'SP064': 2,
    'SP066': 2,
    'SP073': 2,
    'SP080': 2,
    'SP087': 2,
    'SP088': 2,
    'SP089': 2,
    'SP101': 2,
    'SP117': 2,
    'SP128': 2,
    'SP129': 2,
    'SP145': 2,
    'SP159': 2,
    'SP168': 2,
    'SP174': 2,
    'SP189': 2,
    'SP194': 2,
    'SP199': 2,
    'SP200': 2,
    'SP201': 2,
    'SP211': 2,
    'SP217': 2,
    'SP221': 2,
    'SP222': 2,
    'SP228': 2,
    'SP230': 2,
    'SP232': 2,
    'SP236': 2,
    'SP253': 2,
    'SP254': 2,
    'WA001': 2,
    'AD022': 3,
    'AM020': 3,
    'AM064': 3,
    'AV001': 3,
    'BE005': 3,
    'BE403': 3,
    'BI002': 3,
    'BI022': 3,
    'BI027': 3,
    'BI029': 3,
    'BI035': 3,
    'BI036': 3,
    'BI045': 3,
    'BI046': 3,
    'BI055': 3,
    'BI056': 3,
    'BI065': 3,
    'BI088': 3,
    'BM007': 3,
    'BM008': 3,
    'BM009': 3,
    'BM011': 3,
    'BM019': 3,
    'CL008': 3,
    'CS067': 3,
    'EE029': 3,
    'EI018': 3,
    'EI019': 3,
    'EI227': 3,
    'EI228': 3,
    'EM021': 3,
    'EV009': 3,
    'EV011': 3,
    'EV035': 3,
    'EV038': 3,
    'IM002': 3,
    'IO005': 3,
    'MA143': 3,
    'MA165': 3,
    'ME030': 3,
    'ME042': 3,
    'ME048': 3,
    'ME111': 3,
    'NU003': 3,
    'PH008': 3,
    'PH020': 3,
    'PH030': 3,
    'PH033': 3,
    'PH034': 3,
    'PH044': 3,
    'PI001': 3,
    'PM005': 3,
    'PM011': 3,
    'PO013': 3,
    'PO202': 3,
    'SC001': 3,
    'SL001': 3,
    'SP008': 3,
    'SP009': 3,
    'SP010': 3,
    'SP011': 3,
    'SP012': 3,
    'SP013': 3,
    'SP016': 3,
    'SP017': 3,
    'SP018': 3,
    'SP019': 3,
    'SP020': 3,
    'SP021': 3,
    'SP023': 3,
    'SP025': 3,
    'SP026': 3,
    'SP027': 3,
    'SP031': 3,
    'SP032': 3,
    'SP033': 3,
    'SP034': 3,
    'SP038': 3,
    'SP039': 3,
    'SP040': 3,
    'SP041': 3,
    'SP042': 3,
    'SP046': 3,
    'SP048': 3,
    'SP049': 3,
    'SP050': 3,
    'SP051': 3,
    'SP052': 3,
    'SP053': 3,
    'SP054': 3,
    'SP056': 3,
    'SP057': 3,
    'SP058': 3,
    'SP059': 3,
    'SP060': 3,
    'SP061': 3,
    'SP062': 3,
    'SP067': 3,
    'SP068': 3,
    'SP070': 3,
    'SP071': 3,
    'SP072': 3,
    'SP074': 3,
    'SP075': 3,
    'SP076': 3,
    'SP077': 3,
    'SP078': 3,
    'SP081': 3,
    'SP082': 3,
    'SP083': 3,
    'SP084': 3,
    'SP085': 3,
    'SP086': 3,
    'SP090': 3,
    'SP091': 3,
    'SP094': 3,
    'SP096': 3,
    'SP097': 3,
    'SP098': 3,
    'SP099': 3,
    'SP100': 3,
    'SP103': 3,
    'SP104': 3,
    'SP105': 3,
    'SP107': 3,
    'SP108': 3,
    'SP111': 3,
    'SP112': 3,
    'SP114': 3,
    'SP115': 3,
    'SP118': 3,
    'SP119': 3,
    'SP120': 3,
    'SP121': 3,
    'SP122': 3,
    'SP123': 3,
    'SP124': 3,
    'SP125': 3,
    'SP126': 3,
    'SP127': 3,
    'SP130': 3,
    'SP131': 3,
    'SP132': 3,
    'SP133': 3,
    'SP134': 3,
    'SP135': 3,
    'SP136': 3,
    'SP137': 3,
    'SP138': 3,
    'SP140': 3,
    'SP141': 3,
    'SP142': 3,
    'SP143': 3,
    'SP144': 3,
    'SP146': 3,
    'SP147': 3,
    'SP148': 3,
    'SP149': 3,
    'SP150': 3,
    'SP151': 3,
    'SP152': 3,
    'SP153': 3,
    'SP154': 3,
    'SP155': 3,
    'SP156': 3,
    'SP157': 3,
    'SP158': 3,
    'SP161': 3,
    'SP162': 3,
    'SP164': 3,
    'SP165': 3,
    'SP166': 3,
    'SP167': 3,
    'SP169': 3,
    'SP170': 3,
    'SP171': 3,
    'SP172': 3,
    'SP175': 3,
    'SP176': 3,
    'SP177': 3,
    'SP178': 3,
    'SP179': 3,
    'SP180': 3,
    'SP182': 3,
    'SP183': 3,
    'SP185': 3,
    'SP186': 3,
    'SP187': 3,
    'SP188': 3,
    'SP190': 3,
    'SP191': 3,
    'SP193': 3,
    'SP195': 3,
    'SP196': 3,
    'SP197': 3,
    'SP198': 3,
    'SP202': 3,
    'SP203': 3,
    'SP204': 3,
    'SP205': 3,
    'SP206': 3,
    'SP207': 3,
    'SP208': 3,
    'SP209': 3,
    'SP210': 3,
    'SP212': 3,
    'SP213': 3,
    'SP214': 3,
    'SP215': 3,
    'SP216': 3,
    'SP219': 3,
    'SP223': 3,
    'SP224': 3,
    'SP225': 3,
    'SP226': 3,
    'SP227': 3,
    'SP229': 3,
    'SP231': 3,
    'SP233': 3,
    'SP234': 3,
    'SP235': 3,
    'SP237': 3,
    'SP241': 3,
    'SP242': 3,
    'SP243': 3,
    'SP244': 3,
    'SP245': 3,
    'SP246': 3,
    'SP247': 3,
    'SP248': 3,
    'SP249': 3,
    'SP251': 3,
    'SP252': 3,
    'SP255': 3,
    'SP256': 3,
    'TO001': 3,
    'MA130': 4,
    'MA138': 4,
    'MA500': 4,
    'MA601': 4,
    'SP022': 4,
    'SP047': 4,
    'SP102': 4,
    'SP113': 4,
    'SP139': 4,
    'SP163': 4,
    'SP173': 4,
    'SP192': 4,
  },
  type: {
    undefined: '',
    1: '人文学科',
    2: '社会科学',
    3: '自然科学与工程技术',
    4: '数学或逻辑学',
  },
  as (ref) {
    /* if (row[0] in obj_ref_fullref) {
      var match = d_arrange.get(obj_ref_fullref[row[0]][0])[8]
        .match(/可冲抵通识.*课程(.*?)(?:模块)?学分/)
      if (match) {
        return match[1] }}
    else {
      return '' }} */
    return this.map[ref]
  },
}
