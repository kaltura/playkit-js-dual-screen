import ILoader = KalturaPlayerTypes.ILoader;

const {RequestBuilder, ResponseProfileType} = KalturaPlayer.providers;

export class SecondaryMediaLoader implements ILoader {
  _parentEntryId: string = '';
  _requests: any[] = [];
  _response: any = {};

  static get id(): string {
    return 'dualscreen';
  }

  /**
   * @constructor
   * @param {Object} params loader params
   */
  constructor(params: any) {
    this._parentEntryId = params.parentEntryId;
    const headers: Map<string, string> = new Map();
    const request = new RequestBuilder(headers);
    request.service = 'baseEntry';
    request.action = 'list';
    request.params = {
      filter: {objectType: 'KalturaBaseEntryFilter', parentEntryIdEqual: this._parentEntryId},
      responseProfile: {
        type: ResponseProfileType.INCLUDE_FIELDS,
        fields: 'id'
      }
    };
    this.requests.push(request);
  }

  set requests(requests: any[]) {
    this._requests = requests;
  }

  get requests(): any[] {
    return this._requests;
  }

  set response(response: any) {
    this._response = response;
  }

  get response(): any {
    return this._response;
  }

  /**
   * Loader validation function
   * @function
   * @returns {boolean} Is valid
   */
  isValid(): boolean {
    return !!this._parentEntryId;
  }
}
