// tslint:disable no-bitwise
export enum Map {
  none,
  dotted = 1 << 1,
  leadingUnderscore = 1 << 2,
  trailingUnderscore = 1 << 3,

  fullyUnderscored = leadingUnderscore | trailingUnderscore,
  leadingUnderscoreAndDotted = leadingUnderscore | dotted,
  all = dotted | fullyUnderscored,
}
