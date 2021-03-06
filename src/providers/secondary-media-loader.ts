import ILoader = KalturaPlayerTypes.ILoader;

const {RequestBuilder, ResponseTypes} = KalturaPlayer.providers;

interface SecondaryMediaLoaderParams {
  parentEntryId: string;
}

export class SecondaryMediaLoader implements ILoader {
  _parentEntryId: string = '';
  _requests: any[] = [];
  _response: any = {
    entries: []
  };

  static get id(): string {
    return 'dualscreen';
  }

  /**
   * @constructor
   * @param {Object} params loader params
   */
  constructor(params: SecondaryMediaLoaderParams) {
    this._parentEntryId = params.parentEntryId;
    const headers: Map<string, string> = new Map();
    const request = new RequestBuilder(headers);
    const INCLUDE_FIELDS = 1;
    request.service = 'baseEntry';
    request.action = 'list';
    request.params = {
      filter: {
        objectType: 'KalturaBaseEntryFilter',
        parentEntryIdEqual: this._parentEntryId,
        typeIn: `${ResponseTypes.KalturaMediaEntry.MediaType.VIDEO.value},7` // VOD and LIVE
      },
      responseProfile: {
        type: INCLUDE_FIELDS,
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
    const mediaEntryListResponse = new ResponseTypes.KalturaBaseEntryListResponse(response[0]?.data);
    if (mediaEntryListResponse.totalCount) {
      this._response.entries = mediaEntryListResponse?.entries;
    }
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
