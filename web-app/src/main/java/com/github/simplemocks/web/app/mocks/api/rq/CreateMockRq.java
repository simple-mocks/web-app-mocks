package com.github.simplemocks.web.app.mocks.api.rq;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Map;

/**
 * @author sibmaks
 * @since 0.0.1
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateMockRq implements Serializable {
    private long serviceId;
    private String method;
    private String antPattern;
    private String type;
    private Map<String, String> meta;
    private String content;
}
