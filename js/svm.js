// svm.js – Gera arquivos .svm compatíveis com o LMU
// Expõe a função gerarSVM(setup) no escopo global (window.SVM).
// Não usa ES Modules para compatibilidade com scripts carregados via <script src>.

window.SVM = window.SVM || {};

(function() {
  // Mapeamento de carId para detalhes específicos do SVM
  const CAR_SVM_DETAILS = {
    toyota_gr010: {
      vehicleClass: 'Toyota_GR010 Hypercar WEC2023',
      upgrade: '(6,0,0,0)',
      vehPath: 'Toyota_GR010_2023\\1.35\\08_TOYOTA.VEH'
    },
    ferrari_499p: {
      vehicleClass: 'Ferrari_499P Hypercar WEC2023',
      upgrade: '(6,0,0,0)',
      vehPath: 'Ferrari_499P_2023\\1.35\\50_FERRARI.VEH'
    },
    porsche_963: {
      vehicleClass: 'Porsche_963 Hypercar WEC2023',
      upgrade: '(6,0,0,0)',
      vehPath: 'Porsche_963_2023\\1.35\\05_PORSCHE.VEH'
    },
    cadillac_vseriesr: {
      vehicleClass: 'Cadillac_VSeriesR Hypercar WEC2023',
      upgrade: '(6,0,0,0)',
      vehPath: 'Cadillac_VSeriesR_2023\\1.35\\02_CADILLAC.VEH'
    },
    bmw_m_hybrid_v8: {
      vehicleClass: 'BMW_M_Hybrid Hypercar WEC2023',
      upgrade: '(476,0,0,0)',
      vehPath: 'BMW_M_Hybrid_V8_2023\\1.25\\15_25_WRT_A1285A64.VEH'
    },
    bmw_m_hybrid_evo: {
      vehicleClass: 'BMW_M_Hybrid Hypercar WEC2024',
      upgrade: '(476,0,0,0)',
      vehPath: 'BMW_M_Hybrid_V8_2024\\1.25\\15_25_WRT_A1285A64.VEH'
    },
    alpine_a424: {
      vehicleClass: 'Alpine_A424 Hypercar WEC2024',
      upgrade: '(6,0,0,0)',
      vehPath: 'Alpine_A424_2024\\1.15\\36_ALPINE.VEH'
    },
    peugeot_9x8_23: {
      vehicleClass: 'Peugeot_9X8 Hypercar WEC2023',
      upgrade: '(6,0,0,0)',
      vehPath: 'Peugeot_9X8_2023\\1.35\\93_PEUGEOT.VEH'
    },
    peugeot_9x8_24: {
      vehicleClass: 'Peugeot_9X8 Hypercar WEC2024',
      upgrade: '(6,0,0,0)',
      vehPath: 'Peugeot_9X8_2024\\1.15\\93_PEUGEOT.VEH'
    },
    glickenhaus_007: {
      vehicleClass: 'Glickenhaus_007 Hypercar WEC2023',
      upgrade: '(6,0,0,0)',
      vehPath: 'Glickenhaus_007_2023\\1.35\\708_GLICKENHAUS.VEH'
    },
    vanwall_680: {
      vehicleClass: 'Vanwall_680 Hypercar WEC2023',
      upgrade: '(6,0,0,0)',
      vehPath: 'Vanwall_680_2023\\1.35\\04_VANWALL.VEH'
    },
    isotta_tipo6: {
      vehicleClass: 'Hypercar Isotta_TIPO6 WEC2024',
      upgrade: '(273,0,0,0)',
      vehPath: 'Isotta_Tipo6_2024\\1.21\\11_24_ISOTTA_A715S6.VEH'
    },
    lamborghini_sc63: {
      vehicleClass: 'Lamborghini_SC63 Hypercar WEC2024',
      upgrade: '(6,0,0,0)',
      vehPath: 'Lamborghini_SC63_2024\\1.15\\63_LAMBORGHINI.VEH'
    },
    aston_valkyrie: {
      vehicleClass: 'Aston_Valkyrie Hypercar WEC2025',
      upgrade: '(6,0,0,0)',
      vehPath: 'Aston_Valkyrie_2025\\1.00\\00_VALKYRIE.VEH'
    },
    genesis_gmr001: {
      vehicleClass: 'Genesis_GMR001 Hypercar WEC2025',
      upgrade: '(6,0,0,0)',
      vehPath: 'Genesis_GMR001_2025\\1.00\\01_GENESIS.VEH'
    },
    oreca_07: {
      vehicleClass: 'AlpineLMP2 LMP2 Oreca_07 WEC2023',
      upgrade: '(532767,0,0,0)',
      vehPath: 'Oreca_07_LM_2023\\1.55\\36_ALPINE_ECFF2D89.VEH'
    },
    ligier_p325: {
      vehicleClass: 'Ligier_JS_P325 LMP3 ELMS2024',
      upgrade: '(60160,0,0,0)',
      vehPath: 'Ligier_JS_P325_2024\\1.00\\00_LIGIER.VEH'
    },
    ginetta_g61: {
      vehicleClass: 'Ginetta_G61 LMP3 ELMS2024',
      upgrade: '(60160,0,0,0)',
      vehPath: 'Ginetta_G61_2024\\1.00\\00_GINETTA.VEH'
    },
    duqueine_d09: {
      vehicleClass: 'Duqueine_D09_P3 ELMS2025 LMP3',
      upgrade: '(60160,0,0,0)',
      vehPath: 'Duqueine_D09LMP3_2026\\1.01\\397_25_D09P3.VEH'
    },
    aston_vantage_gt3: {
      vehicleClass: 'GT3 Aston_Martin_Vantage_GT3 WEC2025',
      upgrade: '(199779,0,0,0)',
      vehPath: 'Aston_Vantage_GT3_2024\\1.11\\27_25_HEART.VEH'
    },
    bmw_m4_gt3: {
      vehicleClass: 'BMW_M4_LMGT3 GT3 WEC2025',
      upgrade: '(299140,0,0,0)',
      vehPath: 'BMW_M4_LMGT3_2023\\1.19\\31_25_WRT_FB7E8382.VEH'
    },
    corvette_z06: {
      vehicleClass: 'GT3 Corvette_Z06_GT3_R WEC2025',
      upgrade: '(199779,0,0,0)',
      vehPath: 'Corvette_Z06_GT3_R_2024\\1.11\\81_25_PRATT.VEH'
    },
    ferrari_296_gt3: {
      vehicleClass: 'GT3 Ferrari_296_GT3 WEC2025',
      upgrade: '(199779,0,0,0)',
      vehPath: 'Ferrari_296_GT3_2024\\1.11\\55_25_VISTA.VEH'
    },
    ford_mustang_gt3: {
      vehicleClass: 'GT3 Ford_Mustang_GT3 WEC2025',
      upgrade: '(199779,0,0,0)',
      vehPath: 'Ford_Mustang_GT3_2024\\1.11\\77_25_PROTON.VEH'
    },
    lamborghini_evo2: {
      vehicleClass: 'GT3 Lamborghini_Huracan_GT3_EVO2 WEC2025',
      upgrade: '(199779,0,0,0)',
      vehPath: 'Lamborghini_Huracan_GT3_EVO2_2024\\1.11\\60_25_IRON.VEH'
    },
    lexus_rcf: {
      vehicleClass: 'GT3 Lexus_RCF_GT3 WEC2025',
      upgrade: '(199779,0,0,0)',
      vehPath: 'LexusRCF_GT3_2024\\1.11\\78_25_AKKOF71490E4.VEH'
    },
    mclaren_720s: {
      vehicleClass: 'GT3 McLaren_720S_GT3_EVO WEC2025',
      upgrade: '(199779,0,0,0)',
      vehPath: 'McLaren_720S_GT3_EVO_2024\\1.11\\59_25_UNITED.VEH'
    },
    mercedes_amg_gt3: {
      vehicleClass: 'GT3 Mercedes_AMG_GT3 WEC2025',
      upgrade: '(199779,0,0,0)',
      vehPath: 'Mercedes_AMG_GT3_2024\\1.11\\00_25_MERCEDES.VEH'
    },
    porsche_992_gt3: {
      vehicleClass: 'GT3 Porsche_911_GT3_R_LMGT3 WEC2025',
      upgrade: '(739922,0,0,0)',
      vehPath: '911GT3R_2024\\1.15\\397_25_911GT3R.VEH'
    },
    aston_gte: {
      vehicleClass: 'Aston_Martin_Vantage_AMR GTE WEC2023',
      upgrade: '(828712,0,0,0)',
      vehPath: 'Aston_Martin_Vantage_AMR_2023\\1.43\\397_23_AMV.VEH'
    },
    corvette_gte: {
      vehicleClass: 'Chevrolet_Corvette_C8R GTE WEC2023',
      upgrade: '(828712,0,0,0)',
      vehPath: 'Chevrolet_Corvette_C8R_2023\\1.43\\397_23_C8R.VEH'
    },
    ferrari_488_gte: {
      vehicleClass: 'Ferrari_488_GTE_Evo GTE WEC2023',
      upgrade: '(828712,0,0,0)',
      vehPath: 'Ferrari_488_GTE_Evo_2023\\1.43\\397_23_488.VEH'
    },
    porsche_rsr19: {
      vehicleClass: 'Porsche_911_RSR19 GTE WEC2023',
      upgrade: '(828712,0,0,0)',
      vehPath: 'Porsche_911_RSR19_2023\\1.43\\397_23_RSR.VEH'
    }
  };

  // Template mestre com todos os 15 blocos e suas respectivas chaves e valores padrões (baseados na BMW GT3)
  const LMU_SVM_TEMPLATE = [
    {
      section: 'GENERAL',
      keys: [
        { name: 'Notes', defaultRaw: '""', defaultComment: '' },
        { name: 'Symmetric', defaultRaw: '1', defaultComment: '' },
        { name: 'CGHeightSetting', defaultRaw: '0', defaultComment: 'Non-adjustable' },
        { name: 'CGRightSetting', defaultRaw: '0', defaultComment: 'Non-adjustable' },
        { name: 'CGRearSetting', defaultRaw: '0', defaultComment: 'Non-adjustable' },
        { name: 'WedgeSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'FuelSetting', defaultRaw: '34', defaultComment: '0.35' },
        { name: 'FuelCapacitySetting', defaultRaw: '0', defaultComment: '35.0L (4.5 laps)' },
        { name: 'VirtualEnergySetting', defaultRaw: '100', defaultComment: '100% (11.1 laps)' },
        { name: 'NumPitstopsSetting', defaultRaw: '0', defaultComment: '0' },
        { name: 'Pitstop1Setting', defaultRaw: '50', defaultComment: 'N/A' },
        { name: 'Pitstop2Setting', defaultRaw: '50', defaultComment: 'N/A' },
        { name: 'Pitstop3Setting', defaultRaw: '50', defaultComment: 'N/A' }
      ]
    },
    {
      section: 'LEFTFENDER',
      keys: [
        { name: 'FenderFlareSetting', defaultRaw: '0', defaultComment: 'N/A' }
      ]
    },
    {
      section: 'RIGHTFENDER',
      keys: [
        { name: 'FenderFlareSetting', defaultRaw: '0', defaultComment: 'N/A' }
      ]
    },
    {
      section: 'FRONTWING',
      keys: [
        { name: 'FWSetting', defaultRaw: '0', defaultComment: 'Standard' }
      ]
    },
    {
      section: 'REARWING',
      keys: [
        { name: 'RWSetting', defaultRaw: '3', defaultComment: '-0.4 deg' }
      ]
    },
    {
      section: 'BODYAERO',
      keys: [
        { name: 'WaterRadiatorSetting', defaultRaw: '0', defaultComment: 'Open' },
        { name: 'OilRadiatorSetting', defaultRaw: '0', defaultComment: 'Open' },
        { name: 'BrakeDuctSetting', defaultRaw: '0', defaultComment: 'Open' },
        { name: 'BrakeDuctRearSetting', defaultRaw: '0', defaultComment: 'Open' }
      ]
    },
    {
      section: 'SUSPENSION',
      keys: [
        { name: 'FrontWheelTrackSetting', defaultRaw: '0', defaultComment: 'Non-adjustable' },
        { name: 'RearWheelTrackSetting', defaultRaw: '0', defaultComment: 'Non-adjustable' },
        { name: 'FrontAntiSwaySetting', defaultRaw: '4', defaultComment: 'P4' },
        { name: 'RearAntiSwaySetting', defaultRaw: '1', defaultComment: 'P1 (soft)' },
        { name: 'FrontToeInSetting', defaultRaw: '7', defaultComment: '-0.117 deg' },
        { name: 'FrontToeOffsetSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'RearToeInSetting', defaultRaw: '10', defaultComment: '0.234 deg' },
        { name: 'RearToeOffsetSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'LeftCasterSetting', defaultRaw: '0', defaultComment: 'Non-adjustable' },
        { name: 'RightCasterSetting', defaultRaw: '0', defaultComment: 'Non-adjustable' },
        { name: 'LeftTrackBarSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'RightTrackBarSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'Front3rdPackerSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'Front3rdSpringSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'Front3rdTenderSpringSetting', defaultRaw: '0', defaultComment: 'Detached' },
        { name: 'Front3rdTenderTravelSetting', defaultRaw: '0', defaultComment: 'Detached' },
        { name: 'Front3rdSlowBumpSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'Front3rdFastBumpSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'Front3rdSlowReboundSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'Front3rdFastReboundSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'Rear3rdPackerSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'Rear3rdSpringSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'Rear3rdTenderSpringSetting', defaultRaw: '0', defaultComment: 'Detached' },
        { name: 'Rear3rdTenderTravelSetting', defaultRaw: '0', defaultComment: 'Detached' },
        { name: 'Rear3rdSlowBumpSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'Rear3rdFastBumpSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'Rear3rdSlowReboundSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'Rear3rdFastReboundSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'ChassisAdj00Setting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'ChassisAdj01Setting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'ChassisAdj02Setting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'ChassisAdj03Setting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'ChassisAdj04Setting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'ChassisAdj05Setting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'ChassisAdj06Setting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'ChassisAdj07Setting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'ChassisAdj08Setting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'ChassisAdj09Setting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'ChassisAdj10Setting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'ChassisAdj11Setting', defaultRaw: '0', defaultComment: 'N/A' }
      ]
    },
    {
      section: 'CONTROLS',
      keys: [
        { name: 'SteerLockSetting', defaultRaw: '6', defaultComment: '516 deg(19.7 )' },
        { name: 'RearBrakeSetting', defaultRaw: '36', defaultComment: '48.0 / 52.0' },
        { name: 'BrakeMigrationSetting', defaultRaw: '0', defaultComment: ' 0.0' },
        { name: 'BrakePressureSetting', defaultRaw: '62', defaultComment: '102 kgf (85%)' },
        { name: 'HandfrontbrakePressSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'HandbrakePressSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'TCSetting', defaultRaw: '0', defaultComment: 'Available' },
        { name: 'ABSSetting', defaultRaw: '0', defaultComment: 'Available' },
        { name: 'TractionControlMapSetting', defaultRaw: '5', defaultComment: '5' },
        { name: 'TCPowerCutMapSetting', defaultRaw: '3', defaultComment: '3' },
        { name: 'TCSlipAngleMapSetting', defaultRaw: '1', defaultComment: '1' },
        { name: 'AntilockBrakeSystemMapSetting', defaultRaw: '9', defaultComment: '9 (Understeer)' }
      ]
    },
    {
      section: 'ENGINE',
      keys: [
        { name: 'RevLimitSetting', defaultRaw: '0', defaultComment: '7,500' },
        { name: 'EngineBoostSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'RegenerationMapSetting', defaultRaw: '0', defaultComment: '0%' },
        { name: 'ElectricMotorMapSetting', defaultRaw: '0', defaultComment: '0' },
        { name: 'EngineMixtureSetting', defaultRaw: '1', defaultComment: 'Race' },
        { name: 'EngineBrakingMapSetting', defaultRaw: '0', defaultComment: 'N/A' }
      ]
    },
    {
      section: 'DRIVELINE',
      keys: [
        { name: 'FinalDriveSetting', defaultRaw: '0', defaultComment: 'Fixed' },
        { name: 'ReverseSetting', defaultRaw: '0', defaultComment: 'Fixed' },
        { name: 'Gear1Setting', defaultRaw: '0', defaultComment: 'Fixed' },
        { name: 'Gear2Setting', defaultRaw: '0', defaultComment: 'Fixed' },
        { name: 'Gear3Setting', defaultRaw: '0', defaultComment: 'Fixed' },
        { name: 'Gear4Setting', defaultRaw: '0', defaultComment: 'Fixed' },
        { name: 'Gear5Setting', defaultRaw: '0', defaultComment: 'Fixed' },
        { name: 'Gear6Setting', defaultRaw: '0', defaultComment: 'Fixed' },
        { name: 'RatioSetSetting', defaultRaw: '0', defaultComment: 'Le Mans' },
        { name: 'DiffPumpSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'DiffPowerSetting', defaultRaw: '0', defaultComment: 'Non-adjustable' },
        { name: 'DiffCoastSetting', defaultRaw: '0', defaultComment: 'Non-adjustable' },
        { name: 'DiffPreloadSetting', defaultRaw: '0', defaultComment: 'Non-adjustable' },
        { name: 'FrontDiffPumpSetting', defaultRaw: '0', defaultComment: '0%' },
        { name: 'FrontDiffPowerSetting', defaultRaw: '0', defaultComment: '0%' },
        { name: 'FrontDiffCoastSetting', defaultRaw: '0', defaultComment: '0%' },
        { name: 'FrontDiffPreloadSetting', defaultRaw: '0', defaultComment: '1' },
        { name: 'RearSplitSetting', defaultRaw: '0', defaultComment: 'RWD' },
        { name: 'GearAutoUpShiftSetting', defaultRaw: '0', defaultComment: 'Off' },
        { name: 'GearAutoDownShiftSetting', defaultRaw: '0', defaultComment: 'Off' }
      ]
    },
    {
      section: 'FRONTLEFT',
      keys: [
        { name: 'CamberSetting', defaultRaw: '27', defaultComment: '-2.30 deg' },
        { name: 'PressureSetting', defaultRaw: '0', defaultComment: '136 kPa' },
        { name: 'PackerSetting', defaultRaw: '7', defaultComment: '0.7 cm' },
        { name: 'SpringSetting', defaultRaw: '1', defaultComment: '2' },
        { name: 'TenderSpringSetting', defaultRaw: '0', defaultComment: 'Standard' },
        { name: 'TenderTravelSetting', defaultRaw: '0', defaultComment: 'Standard' },
        { name: 'SpringRubberSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'RideHeightSetting', defaultRaw: '4', defaultComment: '5.4 cm' },
        { name: 'SlowBumpSetting', defaultRaw: '3', defaultComment: '3' },
        { name: 'FastBumpSetting', defaultRaw: '4', defaultComment: '4' },
        { name: 'SlowReboundSetting', defaultRaw: '5', defaultComment: '5' },
        { name: 'FastReboundSetting', defaultRaw: '5', defaultComment: '5' },
        { name: 'BrakeDiscSetting', defaultRaw: '0', defaultComment: '3.56 cm' },
        { name: 'BrakePadSetting', defaultRaw: '0', defaultComment: '1' },
        { name: 'CompoundSetting', defaultRaw: '0', defaultComment: 'Medium' }
      ]
    },
    {
      section: 'FRONTRIGHT',
      keys: [
        { name: 'CamberSetting', defaultRaw: '27', defaultComment: '-2.30 deg' },
        { name: 'PressureSetting', defaultRaw: '0', defaultComment: '136 kPa' },
        { name: 'PackerSetting', defaultRaw: '7', defaultComment: '0.7 cm' },
        { name: 'SpringSetting', defaultRaw: '1', defaultComment: '2' },
        { name: 'TenderSpringSetting', defaultRaw: '0', defaultComment: 'Standard' },
        { name: 'TenderTravelSetting', defaultRaw: '0', defaultComment: 'Standard' },
        { name: 'SpringRubberSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'RideHeightSetting', defaultRaw: '4', defaultComment: '5.4 cm' },
        { name: 'SlowBumpSetting', defaultRaw: '3', defaultComment: '3' },
        { name: 'FastBumpSetting', defaultRaw: '4', defaultComment: '4' },
        { name: 'SlowReboundSetting', defaultRaw: '5', defaultComment: '5' },
        { name: 'FastReboundSetting', defaultRaw: '5', defaultComment: '5' },
        { name: 'BrakeDiscSetting', defaultRaw: '0', defaultComment: '3.56 cm' },
        { name: 'BrakePadSetting', defaultRaw: '0', defaultComment: '1' },
        { name: 'CompoundSetting', defaultRaw: '0', defaultComment: 'Medium' }
      ]
    },
    {
      section: 'REARLEFT',
      keys: [
        { name: 'CamberSetting', defaultRaw: '28', defaultComment: '-1.20 deg' },
        { name: 'PressureSetting', defaultRaw: '0', defaultComment: '136 kPa' },
        { name: 'PackerSetting', defaultRaw: '3', defaultComment: '0.3 cm' },
        { name: 'SpringSetting', defaultRaw: '0', defaultComment: '1 (soft)' },
        { name: 'TenderSpringSetting', defaultRaw: '0', defaultComment: 'Standard' },
        { name: 'TenderTravelSetting', defaultRaw: '0', defaultComment: 'Standard' },
        { name: 'SpringRubberSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'RideHeightSetting', defaultRaw: '14', defaultComment: '6.4 cm' },
        { name: 'SlowBumpSetting', defaultRaw: '5', defaultComment: '5' },
        { name: 'FastBumpSetting', defaultRaw: '5', defaultComment: '5' },
        { name: 'SlowReboundSetting', defaultRaw: '3', defaultComment: '3' },
        { name: 'FastReboundSetting', defaultRaw: '3', defaultComment: '3' },
        { name: 'BrakeDiscSetting', defaultRaw: '0', defaultComment: '3.20 cm' },
        { name: 'BrakePadSetting', defaultRaw: '0', defaultComment: '1' },
        { name: 'CompoundSetting', defaultRaw: '0', defaultComment: 'Medium' }
      ]
    },
    {
      section: 'REARRIGHT',
      keys: [
        { name: 'CamberSetting', defaultRaw: '28', defaultComment: '-1.20 deg' },
        { name: 'PressureSetting', defaultRaw: '0', defaultComment: '136 kPa' },
        { name: 'PackerSetting', defaultRaw: '3', defaultComment: '0.3 cm' },
        { name: 'SpringSetting', defaultRaw: '0', defaultComment: '1 (soft)' },
        { name: 'TenderSpringSetting', defaultRaw: '0', defaultComment: 'Standard' },
        { name: 'TenderTravelSetting', defaultRaw: '0', defaultComment: 'Standard' },
        { name: 'SpringRubberSetting', defaultRaw: '0', defaultComment: 'N/A' },
        { name: 'RideHeightSetting', defaultRaw: '14', defaultComment: '6.4 cm' },
        { name: 'SlowBumpSetting', defaultRaw: '5', defaultComment: '5' },
        { name: 'FastBumpSetting', defaultRaw: '5', defaultComment: '5' },
        { name: 'SlowReboundSetting', defaultRaw: '3', defaultComment: '3' },
        { name: 'FastReboundSetting', defaultRaw: '3', defaultComment: '3' },
        { name: 'BrakeDiscSetting', defaultRaw: '0', defaultComment: '3.20 cm' },
        { name: 'BrakePadSetting', defaultRaw: '0', defaultComment: '1' },
        { name: 'CompoundSetting', defaultRaw: '0', defaultComment: 'Medium' }
      ]
    },
    {
      section: 'BASIC',
      keys: [
        { name: 'Downforce', defaultRaw: '0.500000', defaultComment: '' },
        { name: 'Balance', defaultRaw: '0.500000', defaultComment: '' },
        { name: 'Ride', defaultRaw: '0.500000', defaultComment: '' },
        { name: 'Gearing', defaultRaw: '0.500000', defaultComment: '' },
        { name: 'Custom', defaultRaw: '1', defaultComment: '' }
      ]
    }
  ];

  // Converte a porcentagem de brake bias (front) de volta para o RearBrakeSetting raw index e comment
  function getRearBrakeSetting(classId, frontBias) {
    frontBias = parseFloat(frontBias);
    if (isNaN(frontBias)) frontBias = 50.0;
    
    let raw = 0;
    let step = 0.25;
    let maxFront = 57.0;
    
    if (classId === 'lmgt3') {
      maxFront = 57.0;
      step = 0.25;
      raw = Math.round((maxFront - frontBias) / step);
    } else if (classId === 'gte') {
      maxFront = 55.8;
      step = 0.2;
      raw = Math.round((maxFront - frontBias) / step);
    } else if (classId === 'lmp2') {
      maxFront = 55.2;
      step = 0.2;
      raw = Math.round((maxFront - frontBias) / step);
    } else if (classId === 'lmp3') {
      maxFront = 55.1;
      step = 0.2;
      raw = Math.round((maxFront - frontBias) / step);
    } else if (classId === 'hypercar') {
      maxFront = 59.8;
      step = 0.435;
      raw = Math.round((maxFront - frontBias) / step);
    } else {
      maxFront = 57.0;
      step = 0.25;
      raw = Math.round((maxFront - frontBias) / step);
    }
    
    raw = Math.max(0, raw);
    const actualFront = maxFront - raw * step;
    const rearBias = 100 - actualFront;
    
    return {
      raw: raw.toString(),
      display: `${actualFront.toFixed(1)} / ${rearBias.toFixed(1)}`
    };
  }

  // Converte a porcentagem de brake pressure de volta para o BrakePressureSetting raw index e comment
  function getBrakePressureSetting(classId, pressure) {
    pressure = parseInt(pressure);
    if (isNaN(pressure)) pressure = 90;
    
    let raw = 0;
    let kgf = 0;
    
    if (classId === 'lmgt3' || classId === 'gte') {
      raw = Math.round(80 - 1.2 * (100 - pressure));
      kgf = Math.round(1.2 * pressure);
    } else if (classId === 'lmp2') {
      raw = Math.round(80 - 1.25 * (100 - pressure));
      kgf = Math.round(1.2 * pressure);
    } else if (classId === 'lmp3') {
      raw = Math.round(20 - 0.4 * (100 - pressure));
      kgf = Math.round(0.8 * pressure);
    } else if (classId === 'hypercar') {
      raw = Math.round(80 - 1.2 * (100 - pressure));
      kgf = Math.round(1.2 * pressure);
    } else {
      raw = Math.round(80 - 1.2 * (100 - pressure));
      kgf = Math.round(1.2 * pressure);
    }
    
    raw = Math.max(0, raw);
    return {
      raw: raw.toString(),
      display: `${kgf} kgf (${pressure}%)`
    };
  }

  // Função principal exposta globalmente
  window.SVM.gerarSVM = function gerarSVM(setup) {
    const linhas = [];
    const classId = setup.classId || 'lmgt3';
    const carId = setup.carId || '';

    // Obter detalhes e paths do carro
    const carDetails = CAR_SVM_DETAILS[carId] || {
      vehicleClass: `${carId || 'Car'} GT3 WEC2025`,
      upgrade: '(0,0,0,0)',
      vehPath: `${carId || 'Car'}\\1.00\\default.VEH`
    };

    let vehPath = carDetails.vehPath;
    if (setup.carVersion) {
      // Injeta a versão do carro detectada no path correspondente
      vehPath = vehPath.replace(/\\\d+\.\d+\\/, '\\' + setup.carVersion + '\\');
    }

    // 1. Cabeçalho primário
    linhas.push(`VehicleClassSetting="${carDetails.vehicleClass}"`);
    linhas.push(`UpgradeSetting=${carDetails.upgrade}`);
    linhas.push(`//VEH=C:\\Program Files (x86)\\Steam\\steamapps\\common\\Le Mans Ultimate\\Installed\\Vehicles\\${vehPath}`);
    linhas.push(`//UpgradeClass=`);

    // Comentários padrão de upgrades baseados na classe
    if (classId === 'lmgt3' || classId === 'gte') {
      linhas.push(`//BOP=4`);
      linhas.push(`//AI Tweaks=4`);
      linhas.push(`//Estimates=4`);
      linhas.push(`//Gear ratios=1`);
      linhas.push(`//Atmos Conditions=4`);
    } else if (classId === 'lmp2') {
      linhas.push(`//Aero Package=1`);
      linhas.push(`//Fuel tank=1`);
      linhas.push(`//Dive planes=3`);
      linhas.push(`//Engine cover gurney=1`);
      linhas.push(`//Rear wing gurney=1`);
      linhas.push(`//Diffuser strakes=0`);
      linhas.push(`//AI Tweaks=4`);
      linhas.push(`//Estimates=4`);
      linhas.push(`//Visor Mod=0`);
      linhas.push(`//Atmos Conditions=4`);
    } else if (classId === 'lmp3') {
      linhas.push(`//Aero Package=0`);
      linhas.push(`//Front Bumpstop=0`);
      linhas.push(`//Rear Bumpstop=0`);
      linhas.push(`//Gearing=0`);
      linhas.push(`//Estimates=22`);
      linhas.push(`//Atmos Conditions=14`);
    } else {
      linhas.push(`//AI Tweaks=4`);
      linhas.push(`//Estimates=4`);
      linhas.push(`//Atmos Conditions=4`);
    }
    linhas.push(`//Note: settings commented out if using the default`);
    linhas.push(``); // Linha em branco antes de [GENERAL]

    // 2. Loop sobre o template mestre das seções e chaves
    LMU_SVM_TEMPLATE.forEach(secObj => {
      linhas.push(`[${secObj.section}]`);

      secObj.keys.forEach(keyObj => {
        const key = keyObj.name;
        const section = secObj.section;
        
        let raw = "";
        let comment = "";

        // Buscar do openParams se disponível (Open Setup)
        const openParam = setup.openParams?.[section]?.[key];
        if (openParam) {
          if (typeof openParam === 'string') {
            if (openParam.includes('//')) {
              const parts = openParam.split('//');
              raw = parts[0].trim();
              comment = parts[1].trim();
            } else {
              raw = openParam.trim();
              comment = "";
            }
          } else if (typeof openParam === 'object') {
            raw = openParam.raw != null ? String(openParam.raw).trim() : "";
            comment = openParam.display != null ? String(openParam.display).trim() : "";
          }
        }

        // Normalizar valores dinamicamente baseado nos inputs do usuário (Fixed ou Open editados)
        if (section === 'GENERAL' && key === 'FuelSetting') {
          let liters = 34;
          const fuelVal = raw || comment || setup.fuelSetting;
          if (fuelVal) {
            const match = String(fuelVal).match(/^(\d+)/);
            if (match) liters = parseInt(match[1]);
          } else if (classId === 'hypercar') {
            liters = 83;
          } else if (classId === 'lmp2') {
            liters = 70;
          } else if (classId === 'lmp3') {
            liters = 95;
          } else if (classId === 'gte') {
            liters = 9;
          }
          raw = liters.toString();
          comment = (liters / 99).toFixed(2);
        } else if (section === 'GENERAL' && key === 'Notes') {
          raw = `"${setup.notes || ''}"`;
          comment = "";
        } else if (section === 'CONTROLS' && key === 'RearBrakeSetting') {
          let bbVal = setup.brakeBias;
          const rearBrakeVal = raw || comment;
          if (rearBrakeVal) {
            const match = String(rearBrakeVal).match(/^([\d.]+)/);
            if (match) bbVal = parseFloat(match[1]);
          }
          if (bbVal == null || isNaN(bbVal)) bbVal = 50.0;
          const bbInfo = getRearBrakeSetting(classId, bbVal);
          raw = bbInfo.raw;
          comment = bbInfo.display;
        } else if (section === 'CONTROLS' && key === 'BrakePressureSetting') {
          let bpVal = setup.brakePressure;
          const bpValStr = raw || comment;
          if (bpValStr) {
            const match = String(bpValStr).match(/\((\d+)%\)/);
            if (match) {
              bpVal = parseInt(match[1]);
            } else {
              const match2 = String(bpValStr).match(/^(\d+)/);
              if (match2) {
                const num = parseInt(match2[1]);
                bpVal = num <= 100 ? num : Math.round((num / 120) * 100);
              }
            }
          }
          if (bpVal == null || isNaN(bpVal)) bpVal = 90;
          const bpInfo = getBrakePressureSetting(classId, bpVal);
          raw = bpInfo.raw;
          comment = bpInfo.display;
        } else if (section === 'CONTROLS' && key === 'TractionControlMapSetting') {
          let tcVal = setup.tc;
          const tcValStr = raw || comment;
          if (tcValStr) {
            const match = String(tcValStr).match(/^(\d+)/);
            if (match) tcVal = parseInt(match[1]);
          }
          if (tcVal == null || isNaN(tcVal)) tcVal = 5;
          raw = tcVal.toString();
          comment = tcVal.toString();
        } else if (section === 'CONTROLS' && key === 'TCPowerCutMapSetting') {
          let tcpcVal = setup.tcPowerCut;
          const tcpcValStr = raw || comment;
          if (tcpcValStr) {
            const match = String(tcpcValStr).match(/^(\d+)/);
            if (match) tcpcVal = parseInt(match[1]);
          }
          if (tcpcVal == null || isNaN(tcpcVal)) tcpcVal = 3;
          raw = tcpcVal.toString();
          comment = tcpcVal.toString();
        } else if (section === 'CONTROLS' && key === 'TCSlipAngleMapSetting') {
          let tcsaVal = setup.tcSlipAngle;
          const tcsaValStr = raw || comment;
          if (tcsaValStr) {
            if (String(tcsaValStr).toLowerCase().includes('link')) {
              tcsaVal = 'Linked';
            } else {
              const match = String(tcsaValStr).match(/^(\d+)/);
              if (match) tcsaVal = parseInt(match[1]);
            }
          }
          if (tcsaVal === 'Linked' || classId === 'lmp2' || classId === 'lmp3') {
            raw = classId === 'lmp3' ? '5' : '4';
            comment = 'Linked';
          } else {
            if (tcsaVal == null || isNaN(tcsaVal)) tcsaVal = 1;
            raw = tcsaVal.toString();
            comment = tcsaVal.toString();
          }
        } else if (section === 'CONTROLS' && key === 'AntilockBrakeSystemMapSetting') {
          if (classId === 'lmp3') {
            raw = '0';
            comment = 'N/A';
          } else {
            let absVal = setup.abs;
            const absValStr = raw || comment;
            if (absValStr) {
              const match = String(absValStr).match(/^(\d+)/);
              if (match) absVal = parseInt(match[1]);
            }
            if (absVal == null || isNaN(absVal)) absVal = 9;
            raw = absVal.toString();
            comment = absVal.toString() + (carId === 'bmw_m4_gt3' ? ' (Understeer)' : '');
          }
        } else if (section === 'CONTROLS' && key === 'ABSSetting') {
          if (classId === 'lmp3') {
            raw = '0';
            comment = 'N/A';
          } else {
            raw = '0';
            comment = 'Available';
          }
        } else {
          // Para todos os outros parâmetros não-chave, se não existirem no openParams, usar do template
          if (!raw) {
            raw = keyObj.defaultRaw;
            comment = keyObj.defaultComment;
          }
        }

        // Escrever a linha com ou sem comentário
        if (comment) {
          linhas.push(`${key}=${raw}//${comment}`);
        } else {
          linhas.push(`${key}=${raw}`);
        }
      });

      linhas.push(``); // Linha em branco entre seções
    });

    // Adiciona linhas em branco adicionais no final para bater exatamente com a estrutura do jogo
    linhas.push(``);

    return linhas.join('\r\n');
  };
})();
