package com.github.simplemocks.web.app.mocks.api.service.mocks.dto;

import com.github.simplemocks.web.app.mocks.entity.HttpMockEntity;
import com.github.simplemocks.web.app.mocks.entity.HttpServiceEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.Serializable;
import java.util.List;

/**
 * @author sibmaks
 * @since 0.0.1
 */
@Getter
@AllArgsConstructor
public class HttpServiceDto implements Serializable {
    private long serviceId;
    private String code;
    private List<HttpServiceMockDto> mocks;

    public HttpServiceDto(HttpServiceEntity serviceEntity,
                          List<HttpMockEntity> httpMockEntities) {
        this.serviceId = serviceEntity.getId();
        this.code = serviceEntity.getCode();
        this.mocks = httpMockEntities.stream()
                .map(HttpServiceMockDto::new)
                .toList();
    }
}
